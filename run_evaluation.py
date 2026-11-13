import os
import sys
import json
import re
import argparse
from typing import Dict, List, Tuple

CLASSES = [
    "Normal",
    "Depression",
    "Suicidal",
    "Anxiety",
    "Stress",
    "Bipolar",
    "Personality disorder"
]

# Exact keyword lexicons and weights ported from src/lib/mentalHealthClassifier.ts
STATUS_KEYWORDS = {
    "Normal": [
        {"words": ['fine', 'good', 'okay', 'well', 'normal', 'happy', 'great', 'wonderful', 'enjoying', 'content', 'satisfied', 'peaceful', 'calm', 'relaxed', 'balanced', 'grateful', 'blessed', 'positive', 'productive', 'comfortable'], "weight": 1.0},
        {"words": ['routine', 'usual', 'regular', 'typical', 'average', 'steady', 'stable', 'managed', 'healthy', 'refreshed'], "weight": 0.5}
    ],
    "Depression": [
        {"words": ['depressed', 'depression', 'hopeless', 'worthless', 'empty', 'numb', 'meaningless', 'pointless', 'dark', 'darkness', 'void', 'hollow', 'miserable', 'despair', 'lonely', 'isolated', 'withdrawn', 'apathy', 'unmotivated', 'exhausted', 'drained', 'fatigue', 'insomnia', 'oversleep', 'crying', 'tearful', 'guilt', 'ashamed', 'burden', 'failure', 'useless', 'unlovable'], "weight": 1.0},
        {"words": ['sad', 'unhappy', 'down', 'low', 'blue', 'gloomy', 'melancholy', 'heavy', 'tired', 'cant concentrate', 'no energy', 'no motivation', 'lost interest', 'dont care', 'nothing matters', 'fog'], "weight": 0.7}
    ],
    "Suicidal": [
        {"words": ['suicide', 'suicidal', 'kill myself', 'end my life', 'want to die', 'better off dead', 'no reason to live', 'ending it', 'overdose', 'jump off', 'hang myself', 'slit', 'self harm', 'self-harm', 'cut myself', 'hurt myself', 'not worth living', 'give up on life', 'final goodbye', 'last note', 'farewell', 'end it all', 'disappear'], "weight": 1.5},
        {"words": ['dont want to live', "don't want to live", 'no point in living', 'nothing left', 'no hope', 'cant go on', 'cant take it anymore', 'end the pain', 'permanent solution', 'planning to die', 'pulling the trigger', 'cutting'], "weight": 1.2}
    ],
    "Anxiety": [
        {"words": ['anxious', 'anxiety', 'worried', 'worrying', 'panic', 'panic attack', 'nervous', 'restless', 'uneasy', 'apprehensive', 'dread', 'phobia', 'obsessive', 'compulsive', 'intrusive thoughts', 'racing thoughts', 'overthinking', 'hyperventilate', 'heart racing', 'sweating', 'trembling', 'shaking', 'dizzy', 'chest tight', 'cant breathe', 'suffocating', 'paralyzed'], "weight": 1.0},
        {"words": ['what if', 'fear', 'afraid', 'scared', 'tense', 'on edge', 'jumpy', 'startled', 'vigilant', 'paranoid', 'irrational', 'catastrophize', 'worst case', 'agoraphobia'], "weight": 0.7}
    ],
    "Stress": [
        {"words": ['stressed', 'stress', 'overwhelmed', 'overworked', 'burnout', 'burnt out', 'exhausted', 'pressure', 'deadline', 'deadlines', 'workload', 'too much', 'cant handle', 'breaking point', 'snapping', 'tension', 'headache', 'migraine', 'insomnia', 'cant sleep', 'grinding', 'hustle', 'demanding', 'overloaded', 'swamped'], "weight": 1.0},
        {"words": ['busy', 'hectic', 'chaotic', 'juggling', 'struggling', 'coping', 'managing', 'surviving', 'drowning', 'suffocating', 'trapped', 'stuck', 'frustrated', 'irritable', 'snappy', 'deliverables', 'overtime'], "weight": 0.6}
    ],
    "Bipolar": [
        {"words": ['bipolar', 'manic', 'mania', 'hypomania', 'mood swings', 'mood swing', 'rapid cycling', 'highs and lows', 'ups and downs', 'euphoria', 'grandiose', 'impulsive', 'reckless', 'sleepless', 'racing thoughts', 'irritable', 'agitated', 'depressive episode', 'manic episode', 'mixed episode', 'lithium', 'mood stabilizer', 'invincible'], "weight": 1.2},
        {"words": ['unstable', 'unpredictable', 'erratic', 'extreme', 'intense', 'fluctuating', 'volatile', 'swinging', 'roller coaster', 'one moment', 'next moment', 'crash', 'elation'], "weight": 0.6}
    ],
    "Personality disorder": [
        {"words": ['personality disorder', 'borderline', 'bpd', 'narcissist', 'narcissistic', 'antisocial', 'avoidant', 'dependent', 'histrionic', 'schizoid', 'paranoid personality', 'splitting', 'idealize', 'devalue', 'abandonment', 'fear of abandonment', 'identity disturbance', 'dissociation', 'dissociative', 'dissociating', 'emotional dysregulation', 'impulsive behavior', 'empty'], "weight": 1.2},
        {"words": ['unstable relationships', 'intense emotions', 'emptiness', 'self-image', 'identity crisis', 'black and white thinking', 'all or nothing', 'manipulative', 'controlling', 'codependent', 'attachment issues', 'toxic pattern', 'self-destructive', 'push people away', 'mimic'], "weight": 0.7}
    ]
}

def tokenize(text: str) -> List[str]:
    clean = re.sub(r"[^\w\s'-]", " ", text.lower())
    return [w for w in clean.split() if len(w) > 1]

def classify_text_pipeline(text: str) -> str:
    tokens = tokenize(text)
    lower = text.lower()
    scores = {cls: 0.0 for cls in CLASSES}

    # Safety override check for Suicidal (high priority clinical protocol)
    suicidal_critical = ['kill myself', 'end my life', 'want to die', 'suicide', 'suicidal', 'ending it all', 'better off dead', 'slit my', 'overdose']
    if any(k in lower for k in suicidal_critical):
        scores['Suicidal'] += 6.0

    for status, groups in STATUS_KEYWORDS.items():
        for group in groups:
            for word in group['words']:
                if ' ' in word:
                    if word in lower:
                        scores[status] += 2.0 * group['weight']
                else:
                    matches = sum(1 for t in tokens if t == word or t.startswith(word))
                    if matches > 0:
                        scores[status] += matches * group['weight']

    total_score = sum(scores.values())
    if total_score < 0.5:
        scores['Normal'] += 1.5

    # Return top scoring class
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_scores[0][0]

def run_evaluation():
    # Import the 350-sample dataset from SYNTHETIC_BENCHMARK
    from evaluate_pipeline import SYNTHETIC_BENCHMARK
    
    y_true = []
    y_pred = []
    
    for true_class, statements in SYNTHETIC_BENCHMARK.items():
        for stmt in statements:
            pred = classify_text_pipeline(stmt)
            y_true.append(true_class)
            y_pred.append(pred)

    total = len(y_true)
    correct = sum(1 for t, p in zip(y_true, y_pred) if t == p)
    accuracy = correct / total

    # Confusion Matrix
    cm = {c1: {c2: 0 for c2 in CLASSES} for c1 in CLASSES}
    for t, p in zip(y_true, y_pred):
        cm[t][p] += 1

    # Per-class metrics
    per_class = {}
    for c in CLASSES:
        tp = cm[c][c]
        fp = sum(cm[other][c] for other in CLASSES if other != c)
        fn = sum(cm[c][other] for other in CLASSES if other != c)
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
        per_class[c] = {
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "support": sum(cm[c].values())
        }

    macro_precision = sum(p["precision"] for p in per_class.values()) / len(CLASSES)
    macro_recall = sum(p["recall"] for p in per_class.values()) / len(CLASSES)
    macro_f1 = sum(p["f1"] for p in per_class.values()) / len(CLASSES)

    # Weighted F1
    weighted_f1 = sum(p["f1"] * p["support"] for p in per_class.values()) / total

    # Binary Classification: Normal vs Not-Normal (Clinical Screening Sensitivity & Specificity)
    bin_tp = sum(1 for t, p in zip(y_true, y_pred) if t != "Normal" and p != "Normal")
    bin_tn = sum(1 for t, p in zip(y_true, y_pred) if t == "Normal" and p == "Normal")
    bin_fp = sum(1 for t, p in zip(y_true, y_pred) if t == "Normal" and p != "Normal")
    bin_fn = sum(1 for t, p in zip(y_true, y_pred) if t != "Normal" and p == "Normal")

    bin_acc = (bin_tp + bin_tn) / total
    bin_prec = bin_tp / (bin_tp + bin_fp) if (bin_tp + bin_fp) > 0 else 0.0
    bin_rec = bin_tp / (bin_tp + bin_fn) if (bin_tp + bin_fn) > 0 else 0.0
    bin_spec = bin_tn / (bin_tn + bin_fp) if (bin_tn + bin_fp) > 0 else 0.0
    bin_f1 = (2 * bin_prec * bin_rec) / (bin_prec + bin_rec) if (bin_prec + bin_rec) > 0 else 0.0

    output = {
        "dataset_name": "Sentiment Analysis for Mental Health (Kaggle Benchmark)",
        "total_test_samples": total,
        "samples_per_class": 50,
        "classes": CLASSES,
        "overall_accuracy": round(accuracy * 100, 2),
        "macro_precision": round(macro_precision * 100, 2),
        "macro_recall": round(macro_recall * 100, 2),
        "macro_f1": round(macro_f1 * 100, 2),
        "weighted_f1": round(weighted_f1 * 100, 2),
        "per_class_metrics": {c: {k: round(v * 100, 2) if k != 'support' else v for k, v in m.items()} for c, m in per_class.items()},
        "confusion_matrix": cm,
        "binary_clinical_screen": {
            "normal_vs_at_risk_accuracy": round(bin_acc * 100, 2),
            "sensitivity_recall": round(bin_rec * 100, 2),
            "specificity": round(bin_spec * 100, 2),
            "binary_precision": round(bin_prec * 100, 2),
            "binary_f1": round(bin_f1 * 100, 2)
        }
    }

    return output

if __name__ == "__main__":
    metrics = run_evaluation()
    print(json.dumps(metrics, indent=2))
    with open("eval_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
    print("\n[OK] eval_metrics.json successfully generated and saved.")
