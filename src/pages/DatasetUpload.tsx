import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const STORAGE_KEY = 'mental-health-custom-keywords';

interface ParseResult {
  totalRows: number;
  statusCounts: Record<string, number>;
  savedAt: string;
}

function parseCSV(text: string): { statement: string; status: string }[] {
  const lines = text.split('\n');
  const rows: { statement: string; status: string }[] = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Handle CSV with possible quoted fields
    let statement = '';
    let status = '';
    
    if (line.startsWith('"')) {
      const closingQuote = line.indexOf('",', 1);
      if (closingQuote !== -1) {
        statement = line.substring(1, closingQuote);
        status = line.substring(closingQuote + 2).replace(/"/g, '').trim();
      }
    } else {
      const lastComma = line.lastIndexOf(',');
      if (lastComma !== -1) {
        statement = line.substring(0, lastComma).trim();
        status = line.substring(lastComma + 1).trim();
      }
    }
    
    if (statement && status) {
      rows.push({ statement, status });
    }
  }
  return rows;
}

function extractKeywords(rows: { statement: string; status: string }[]): Record<string, string[]> {
  const wordFreq: Record<string, Record<string, number>> = {};
  const globalFreq: Record<string, number> = {};
  
  for (const row of rows) {
    const words = row.statement.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 3);
    const unique = [...new Set(words)];
    
    if (!wordFreq[row.status]) wordFreq[row.status] = {};
    
    for (const word of unique) {
      wordFreq[row.status][word] = (wordFreq[row.status][word] || 0) + 1;
      globalFreq[word] = (globalFreq[word] || 0) + 1;
    }
  }
  
  // Extract distinctive words per status (high frequency in status, low globally relative)
  const result: Record<string, string[]> = {};
  const stopWords = new Set(['that', 'this', 'with', 'have', 'been', 'were', 'they', 'their', 'from', 'will', 'would', 'could', 'should', 'about', 'just', 'like', 'know', 'think', 'want', 'make', 'when', 'what', 'your', 'some', 'them', 'than', 'more', 'very', 'also', 'even', 'into', 'much', 'most', 'being', 'doing', 'going', 'after', 'over', 'only', 'does', 'because']);
  
  for (const [status, words] of Object.entries(wordFreq)) {
    const statusTotal = Object.values(words).reduce((a, b) => a + b, 0);
    const scored = Object.entries(words)
      .filter(([word]) => !stopWords.has(word))
      .map(([word, count]) => ({
        word,
        score: (count / statusTotal) / (globalFreq[word] / Object.values(globalFreq).reduce((a, b) => a + b, 0)),
      }))
      .sort((a, b) => b.score - a.score);
    
    result[status] = scored.slice(0, 30).map(s => s.word);
  }
  
  return result;
}

const DatasetUpload = () => {
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ParseResult | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return data._meta || null;
      }
    } catch {}
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }

    setError(null);
    setParsing(true);
    setProgress(10);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setProgress(30);
        const text = event.target?.result as string;
        const rows = parseCSV(text);
        
        setProgress(60);
        
        if (rows.length < 10) {
          setError('CSV appears empty or incorrectly formatted. Expected columns: statement, status');
          setParsing(false);
          return;
        }

        const keywords = extractKeywords(rows);
        setProgress(85);

        const statusCounts: Record<string, number> = {};
        rows.forEach(r => {
          statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
        });

        const meta: ParseResult = {
          totalRows: rows.length,
          statusCounts,
          savedAt: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...keywords, _meta: meta }));
        
        setProgress(100);
        setResult(meta);
        setParsing(false);
      } catch (err) {
        setError('Failed to parse CSV. Please check the file format.');
        setParsing(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
      setParsing(false);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Dataset Integration</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Upload the Kaggle "Sentiment Analysis for Mental Health" CSV to enhance classification accuracy.
        </p>

        <Card className="mb-6 shadow-md border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" /> Upload Dataset CSV
            </CardTitle>
            <CardDescription>
              Download from{' '}
              <a href="https://www.kaggle.com/datasets/suchintikasarkar/sentiment-analysis-for-mental-health" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Kaggle
              </a>
              , then upload the CSV file here. All processing happens locally in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFile}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
            />

            {parsing && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Processing dataset...</p>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card className="shadow-md border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" /> Dataset Loaded
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/40 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{result.totalRows.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Rows</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{Object.keys(result.statusCounts).length}</p>
                  <p className="text-xs text-muted-foreground">Categories</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(result.statusCounts).map(([status, count]) => (
                  <Badge key={status} variant="secondary" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    {status}: {count.toLocaleString()}
                  </Badge>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Loaded on {new Date(result.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>

              <Button variant="ghost" size="sm" onClick={handleClear} className="text-destructive hover:text-destructive gap-1">
                <Trash2 className="h-4 w-4" /> Remove Dataset
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DatasetUpload;
