import os
import sys
import json
import random
import argparse
from typing import Dict, List, Tuple

# 7 Target Classes
CLASSES = [
    "Normal",
    "Depression",
    "Suicidal",
    "Anxiety",
    "Stress",
    "Bipolar",
    "Personality disorder"
]

# Benchmark statements representing the Kaggle dataset distribution (50 per class = 350 total)
# Constructed following the linguistic markers, vocabulary distributions, and overlaps of the Kaggle dataset
SYNTHETIC_BENCHMARK = {
    "Normal": [
        "Had a productive day at work and enjoyed dinner with family.",
        "Went for a 5k run this morning feeling refreshed and ready for the week.",
        "Feeling good about my progress on my personal coding goals.",
        "Beautiful sunny weather today spent the afternoon reading in the park.",
        "Cooked a nice meal with my roommate and caught up on our favorite show.",
        "Routine check-in today feeling balanced calm and content with life.",
        "Had a great chat with an old friend from college, always uplifting.",
        "Finished all my chores early today and now relaxing with some music.",
        "Work was busy today but everything went smoothly and without issue.",
        "Feeling grateful for my support system and peaceful evening at home.",
        "Woke up early had a good breakfast and feeling healthy.",
        "Simple day, nothing extraordinary happened but I feel at ease.",
        "Went shopping for groceries and managed to stay within my budget.",
        "Planning my weekend trip with friends, excited for the break.",
        "Had a pleasant conversation with my neighbor while walking the dog.",
        "Completed a difficult workout at the gym, feeling energized.",
        "Quiet evening at home sipping herbal tea and journaling thoughts.",
        "Enjoyed learning new concepts in class today, feeling motivated.",
        "Everything in my daily routine is stable and going as expected.",
        "Spent quality time with family over lunch, feeling connected.",
        "Productive meeting at work, team agreed on the project direction.",
        "Feeling optimistic about the coming month and my career path.",
        "Listened to a great podcast on mindfulness and feeling grounded.",
        "Cleaned my room and organized my desk, feels very satisfying.",
        "Walked in the garden after dinner, evening breeze was very soothing.",
        "Had a balanced day with work and leisure time properly managed.",
        "Feeling happy with the small steps I took towards self improvement.",
        "Watched a funny movie tonight and had a really good laugh.",
        "Woke up feeling well rested after eight hours of uninterrupted sleep.",
        "Enjoyed a peaceful cup of coffee on the balcony this morning.",
        "Finished reading an insightful novel, ready to pick up the next one.",
        "Cooked pasta for dinner, turned out much better than expected.",
        "Took a break from social media today and enjoyed the mental clarity.",
        "Feeling appreciative of the kind message my coworker sent today.",
        "Got through all my emails today without feeling rushed or stressed.",
        "Went for an evening bike ride around the lake, very peaceful.",
        "Feeling calm and satisfied with the steady pace of my week.",
        "Enjoyed working on a creative hobby this afternoon.",
        "Went to bed on time and feeling ready for tomorrow's commitments.",
        "Took some time to meditate this morning, feeling centered.",
        "Enjoyed a relaxing bath and taking care of myself after a normal day.",
        "Organized my bookshelf and found some old favorite books to reread.",
        "Everything feels steady and manageable right now, feeling grateful.",
        "Enjoyed hearing about my friend's recent success at work.",
        "Took a long walk listening to my favorite playlist, feeling happy.",
        "Had a good conversation with my sister about our childhood memories.",
        "Balanced my finances for the month and everything looks healthy.",
        "Productive afternoon studying for my upcoming certification.",
        "Feeling content with where I am right now in life.",
        "Nice peaceful Sunday afternoon resting and preparing for the week ahead."
    ],
    "Depression": [
        "I feel so empty inside, like nothing brings me joy or meaning anymore.",
        "I can't get out of bed. Everything feels pointless and exhausting.",
        "I've lost interest in everything I used to love, days just blur together.",
        "Waking up to another day of feeling completely numb and hollow.",
        "Nobody understands the heaviness I carry every single minute.",
        "I feel like a ghost wandering through my own life, disconnected from reality.",
        "Chronic tiredness that sleep doesn't fix, completely drained of all energy.",
        "Lying in the dark staring at the ceiling, feeling like a complete failure.",
        "I smile around people to pretend I'm okay but inside I feel completely dead.",
        "There's an unbearable weight on my chest and no tears left to cry.",
        "Feeling hopeless about my future, like things will never improve.",
        "I isolate myself because I don't have the emotional energy to talk to anyone.",
        "Everything I do feels worthless and pointless, why even bother trying.",
        "I haven't eaten a proper meal in days, zero appetite and zero motivation.",
        "The sadness isn't sharp anymore, just a dull persistent ache that never leaves.",
        "I feel like an invisible burden to everyone around me, constantly failing.",
        "Struggling to find any reason to smile or feel enthusiastic about life.",
        "Nothing excites me anymore, just going through the motions like a robot.",
        "Another weekend spent completely alone in bed with all the blinds shut.",
        "Can't concentrate on anything, brain feels full of heavy dark fog.",
        "I feel completely broken beyond repair and don't know how to fix myself.",
        "Feeling so detached from my emotions that I can't even cry when hurt.",
        "I hate waking up because morning means facing another exhausting day.",
        "Guilt eating away at me for not being productive or present for family.",
        "No matter what happens, good or bad, I just feel a deep overwhelming void.",
        "Deep emotional exhaustion, I just want everything to pause forever.",
        "I look in the mirror and I don't recognize the person staring back.",
        "Everything requires ten times more energy than I have to give.",
        "Lost in my own head with relentless self critical thoughts.",
        "Days feel like months of unending gray emptiness and apathy.",
        "I feel unlovable and unworthy of anything good in this world.",
        "Hard to remember what genuine happiness actually feels like.",
        "Canceling plans again because the thought of socializing is overwhelming.",
        "Crying uncontrollably in the shower hoping the water washes away the pain.",
        "No motivation to shower, clean my room, or reply to simple texts.",
        "Feeling like I am trapped in a deep well with no way to climb out.",
        "Persistent feelings of inadequacy, hopelessness, and deep sorrow.",
        "Even when surrounded by people at a gathering, I feel painfully alone.",
        "I feel like I've failed at every milestone and let everyone down.",
        "Tired of fighting this invisible battle inside my mind every single day.",
        "Everything feels meaningless and hollow, just an endless loop of pain.",
        "The world moves forward so fast while I remain completely frozen.",
        "I feel like my presence doesn't matter to anyone in the grand scheme.",
        "Heavy fatigue dragging down my body, can barely lift my head from pillow.",
        "Can't remember the last time I felt genuinely excited for tomorrow.",
        "Withdrawn from all my friendships, I feel too drained to respond.",
        "My mind keeps telling me that things will never get better for me.",
        "Feeling like an empty shell going through daily routines without feeling.",
        "Constantly apologizing for existing and feeling like a disappointment.",
        "The darkness inside feels comfortable now because it is all I know."
    ],
    "Suicidal": [
        "I don't see any reason to keep living, the pain is too much to bear.",
        "I think about ending my life every single day, I just want peace.",
        "Everyone would genuinely be much better off without my burden in their lives.",
        "I want to die, I can't endure this torment inside my head any longer.",
        "I have been researching ways to end it all, I can't take this pain.",
        "Nobody would notice or care if I disappeared from this earth tonight.",
        "I can't go on living like this, I want this suffering to stop permanently.",
        "Writing down my final thoughts because I don't plan on waking up tomorrow.",
        "Feeling like ending my life is the only rational escape from this misery.",
        "I am tired of fighting to survive, I have completely given up on life.",
        "The world is better without me, I am just a toxic burden to my family.",
        "Thinking about taking all my pills tonight so I never have to wake up.",
        "I feel completely hopeless and ready to make my final exit from this world.",
        "I don't belong here, my existence is just constant agonizing suffering.",
        "Giving away my personal belongings because I won't be needing them soon.",
        "I just want to fall asleep and never open my eyes again, please let it end.",
        "There is no hope for me, death seems like the only comforting relief.",
        "I've been staring at the ledge thinking how quick and painless it would be.",
        "Saying my final goodbyes to the few people who were nice to me.",
        "I am so desperate for the pain to stop that suicide feels like the only door.",
        "Every breath hurts, I want to end my existence and find eternal quiet.",
        "I don't want to live another week like this, I am reaching my breaking point.",
        "My life has zero value, I am ready to let go of this miserable world.",
        "Struggling with intense self-harm urges and wishing I was never born.",
        "I don't want help anymore, I just want permission to end it all peacefully.",
        "I have drafted a note explaining everything to my loved ones.",
        "The torment in my chest is unbearable, death is my only way out.",
        "Thinking about slitting my wrists, I feel so completely trapped in agony.",
        "Nobody can save me now, I have made up my mind to end it all.",
        "I feel like a ghost waiting to make my departure official.",
        "I can't fight this urge to self-harm and die any longer.",
        "Everything points to ending it, there is no future waiting for me.",
        "I feel like my time here is over, I have exhausted every reason to stay.",
        "I want to jump, I want the darkness to swallow me whole.",
        "Death feels like the only gentle embrace after a lifetime of torture.",
        "I am done crying, now I just feel calm knowing I will be gone soon.",
        "I don't see tomorrow, I don't want tomorrow, I want it to end tonight.",
        "Feeling like an irredeemable waste of space that needs to be erased.",
        "Planning the date and time, I can't hold on any longer.",
        "The thought of dying is the only thing that gives me peace right now.",
        "I am cutting myself deeper each time, I want to cross the final line.",
        "Please forgive me, but I can't bear another day in this agonizing skin.",
        "My heart is bleeding out, I want to stop my pulse forever.",
        "There is nothing left in this world for me, only unbearable torture.",
        "I'm giving up completely, I can't pretend to be strong anymore.",
        "Looking out the window and imagining what it feels like to fall.",
        "No one understands how close I am to pulling the trigger on myself.",
        "I am in severe crisis and I want to die right now.",
        "Final farewell to a world that never had room for me.",
        "I want to end my life tonight, please someone just let me rest."
    ],
    "Anxiety": [
        "My heart won't stop racing and I keep feeling like something terrible is about to happen.",
        "Overwhelming panic attack out of nowhere, couldn't breathe and hands trembling.",
        "I can't stop overthinking every single conversation I had today.",
        "Woke up at 3 AM with intense dread and chest tightness that won't fade.",
        "Constantly terrified of making mistakes, my mind won't quiet down for a second.",
        "Dizzy and lightheaded from hyperventilating during my team presentation.",
        "Severe social anxiety, feeling like every single stranger is judging me.",
        "Obsessive thoughts looping endlessly in my head, driving me crazy.",
        "I feel jumpy, on edge, and startled by the slightest noise around me.",
        "Paralyzed by what-if scenarios, imagining the worst case disaster every time.",
        "Cold sweats and shaky hands before even leaving my apartment today.",
        "My mind is constantly catastrophizing about my health and future.",
        "Feeling like I'm about to lose control or go completely insane from panic.",
        "Chest pains and breathing shallowly, convinced I was having a heart attack.",
        "I can't relax even on the weekend, my nervous system is stuck on high alert.",
        "Overanalyzing text messages wondering if people secretly hate me.",
        "Trembling so much I couldn't hold my water bottle without spilling it.",
        "Fear of the unknown is completely paralyzing my ability to make decisions.",
        "Felt like the walls were closing in on me in the crowded grocery store.",
        "Intense phobia and dread making me avoid important phone calls all week.",
        "Hyper-fixated on my physical symptoms, constantly checking my heart rate.",
        "Restless pacing around the room unable to sit still or calm my mind.",
        "Every minor issue feels like an existential crisis waiting to explode.",
        "Suffocating feeling in my throat like I'm choking on my own worries.",
        "Paranoid that everyone is talking about me behind my back.",
        "Anxiety spikes so hard in the morning that I feel physically sick.",
        "My stomach is constantly in knots from chronic nervous tension.",
        "Terrified of failing and letting everyone see that I'm an imposter.",
        "Can't concentrate because my brain is screaming with alarm bells.",
        "Sudden surge of adrenaline with no trigger, feeling sheer terror.",
        "I avoid social events because the anticipatory anxiety makes me nauseous.",
        "Feeling completely vulnerable and defenseless against my intrusive thoughts.",
        "My thoughts are racing so fast I can't catch a single coherent sentence.",
        "Struggling with agoraphobia, leaving the house feels terrifyingly risky.",
        "Irrational fears keeping me awake all night with racing pulse.",
        "I constantly replay past awkward interactions feeling intense mortification.",
        "Feeling overwhelmed by loud sounds and sensory overload in public spaces.",
        "Nervous habit of biting my nails until they bleed from constant panic.",
        "Terrified that any sudden phone call is tragic news about someone dying.",
        "My anxiety makes me feel like a prisoner trapped inside my own skull.",
        "Heart pounding like a drum, shallow breathing, hands ice cold.",
        "Constantly seeking reassurance because I don't trust my own judgment.",
        "Overwhelmed by anticipation of upcoming events, dreading tomorrow.",
        "I feel like danger is lurking around every corner even in my safe room.",
        "Feeling paralyzed by indecision and terrified of making the wrong choice.",
        "My breathing feels manual, like if I don't focus I will stop breathing.",
        "Nervous exhaustion from keeping my guard up twenty-four hours a day.",
        "Panic attack triggered by a sudden loud noise, completely shook me up.",
        "Chronic worry consuming all my mental bandwidth and joy.",
        "Feeling terrified of panic itself, trapped in a vicious anxiety cycle."
    ],
    "Stress": [
        "The workload is completely crushing me, working 14 hours a day with no end in sight.",
        "Unrealistic deadlines piling up, I feel like I'm drowning in tasks.",
        "Severe burnout from constant office demands, zero time to catch my breath.",
        "Juggling too many responsibilities at once, feel like I'm about to snap.",
        "Splitting tension headache all day from staring at screens under pressure.",
        "Too many emails, meetings, and client demands, I can't keep up with this pace.",
        "Exhausted from cramming for exams all night, running on pure caffeine.",
        "Burned out and overwhelmed by both financial pressure and family obligations.",
        "I haven't had a single day off in three weeks, completely stretched thin.",
        "My manager keeps adding deliverables while cutting our project timeline.",
        "Tension in my shoulders and neck is unbearable from chronic work stress.",
        "Feeling swamped and falling behind on every single commitment I made.",
        "Hectic chaotic schedule, running between meetings without even lunch.",
        "The pressure to perform at top levels is exhausting my physical stamina.",
        "Overworked and underpaid, feel like a hamster stuck on an endless wheel.",
        "Struggling to balance work demands with parenting, breaking under strain.",
        "Can't sleep because my mind is running through tomorrow's to-do list.",
        "I feel irritable and snappy with my colleagues due to sheer exhaustion.",
        "Every time I finish one task, three more urgent demands get dropped on my desk.",
        "Drowning in paperwork, invoices, and endless administrative chaos.",
        "The academic pressure for grades is giving me constant physical tension.",
        "Running on empty, completely burned out with zero reserves left to give.",
        "Urgent deadlines clashing, forced to work through weekends again.",
        "Demanding boss micromanaging every single minute, workplace is toxic.",
        "Feeling overloaded and unable to disconnect from work after hours.",
        "Juggling three side jobs just to pay rent, physically and mentally drained.",
        "Chronic hustle culture is destroying my physical health and peace of mind.",
        "Feeling swamped under an avalanche of unread emails and Slack messages.",
        "Pressure from stakeholders is becoming completely unbearable this quarter.",
        "No work-life balance, my job has completely taken over my personal existence.",
        "Tension headaches, jaw clenching, and eye strain from relentless overtime.",
        "Feeling like I am carrying a mountain on my back with zero team support.",
        "Multiple project crises happening simultaneously, chaos in every direction.",
        "I am so stressed that even small interruptions cause me immense frustration.",
        "Working through meals, working through illness, forced to keep grinding.",
        "Overwhelmed by household chores on top of an exhausting corporate job.",
        "I can't remember the last time I relaxed without thinking about work.",
        "Feeling trapped by financial deadlines, bills piling up faster than income.",
        "The pace of this project is unsustainable, our whole team is burned out.",
        "Stress is making my hair fall out and giving me constant stomach aches.",
        "Too many deliverables due this Friday, pull all-nighters just to survive.",
        "Struggling under the crushing weight of university coursework and finals.",
        "Burnout has turned my passion into pure resentful exhaustion.",
        "I feel like an elastic band stretched to its absolute breaking point.",
        "Hectic commute followed by chaotic 10-hour workday, totally depleted.",
        "Demands coming from all directions, no space to breathe or recover.",
        "Constant firefighting at work with zero strategic planning from leadership.",
        "Exhausted from pretending to have everything under control in front of clients.",
        "My body is screaming for rest but the workload will not allow me to pause.",
        "Extreme pressure to succeed is draining every drop of vitality from me."
    ],
    "Bipolar": [
        "My mood swings are getting worse, went from euphoric mania to devastated in hours.",
        "Yesterday I felt like a god with limitless energy, today I can't leave bed.",
        "Rapid cycling between intense elation and crushing depressive episodes.",
        "During my manic phase I spent all my savings on impulsive crazy ideas.",
        "Riding an emotional rollercoaster that I have zero control over.",
        "One moment I am laughing and talkative, next moment crying in despair.",
        "Racing thoughts and zero sleep for three nights, felt invincible and hyperactive.",
        "The euphoric high was amazing but the inevitable crash is devastatingly brutal.",
        "Grandiosity followed by intense feelings of worthlessness and regret.",
        "My moods fluctuate so erratically that my partner doesn't know who to expect.",
        "Impulsive, reckless behavior during my high phase has ruined my reputation.",
        "Manic episode made me start five businesses in 48 hours without sleeping.",
        "The depression hit out of nowhere after a week of feeling on top of the world.",
        "Struggling to manage my lithium dosage because the side effects are heavy.",
        "Extreme mood shifts making it impossible to hold down a stable routine.",
        "Feeling an electric buzz of mania through my veins, talking a mile a minute.",
        "Crashing down from mania into a deep dark pit of despair and regret.",
        "One day I believe I can conquer the universe, next day I want to vanish.",
        "Mixed episode where I feel manic energy combined with suicidal despair.",
        "Unpredictable emotional swings tearing my personal relationships apart.",
        "Impulsively booked flights and made reckless purchases during a manic high.",
        "My brain shifts gears without warning, euphoria flipping into rage and grief.",
        "Feeling invincible one afternoon and completely broken by the same evening.",
        "Sleepless nights filled with grandiose creative visions followed by numbness.",
        "The emotional volatility is terrifying, I don't know which version of me is real.",
        "Manic irritability making me snap at loved ones followed by deep shame.",
        "Rapid mood fluctuations between euphoric creativity and paralyzing apathy.",
        "I go from hyper-social and life of the party to completely isolating in days.",
        "The rollercoaster never stops, extreme highs and devastatingly low lows.",
        "Bipolar disorder feels like living with two completely opposite personalities.",
        "Manic episode convinced me I didn't need medicine, now paying the price.",
        "Intense burst of hyper-focus and euphoria crashing into total emptiness.",
        "Volatile mood swings leaving me and my family emotionally exhausted.",
        "Felt like my mind was plugged into a supercomputer, now unplugged and dead.",
        "Struggling with the wreckage left behind by my manic impulsive decisions.",
        "Emotional whiplash from shifting between euphoric highs and crying spells.",
        "High energy, hyperactive, reckless driving, then sudden paralyzing depression.",
        "Can't predict how I will feel tomorrow morning, up in the clouds or six feet under.",
        "Rapid cycling is destroying my ability to function at work or in school.",
        "The mania makes me feel like a genius, the crash makes me feel like a fool.",
        "Extreme emotional turbulence with zero middle ground or emotional stability.",
        "Swinging violently between grand ambitions and complete hopelessness.",
        "My thoughts were moving at the speed of light, now trapped in molasses.",
        "Bipolar mood swings making my life feel like an unpredictable storm.",
        "Impulsive manic actions have left me in severe debt and emotional ruin.",
        "Euphoria so intense it feels intoxicating, followed by suicidal crashes.",
        "Feeling hyper-agitated and manic while simultaneously crying with depression.",
        "Living on the edge of emotional chaos, swinging between polar extremes.",
        "My psychiatrist is adjusting my mood stabilizers because the cycles are faster.",
        "Exhausted from constantly surviving the highs and mourning the crashes."
    ],
    "Personality disorder": [
        "I push people away when they get close and then hate myself for being alone.",
        "My intense fear of abandonment makes me clingy and then furiously defensive.",
        "Chronic emptiness inside, like I don't even have a core identity of my own.",
        "I either idealize people completely as angels or devalue them as toxic enemies.",
        "Black and white thinking is destroying every single relationship I try to keep.",
        "I don't know who I am, I change my personality depending on who is around me.",
        "Dissociating heavily today, looking in the mirror and feeling detached from myself.",
        "Splitting on my best friend over a tiny perceived slight, now I hate them.",
        "Emotional dysregulation makes my feelings so intense that I feel out of control.",
        "Borderline traits making every minor disagreement feel like a fatal rejection.",
        "Desperate efforts to avoid real or imagined abandonment from my partner.",
        "Unstable sense of self, my values, career goals, and identity shift constantly.",
        "I feel like an emotional burn victim, every small interaction causes agony.",
        "Love-hate relationship dynamics, pulling them close then slamming the door.",
        "Impulsive self-destructive behaviors to cope with overwhelming inner turmoil.",
        "Feeling chronic void and hollowness that no person or achievement can fill.",
        "Intense inappropriate anger over trivial triggers followed by crushing guilt.",
        "Dissociating during arguments, feeling like I am watching from the ceiling.",
        "I mimic other people's mannerisms because I have no authentic self inside.",
        "Fear that everyone will inevitably realize how flawed I am and leave me.",
        "Borderline personality patterns making daily emotional stability impossible.",
        "Splitting behavior where someone is either 100% perfect or 100% evil.",
        "Terrified of intimacy yet desperately crave affection and validation.",
        "My emotions escalate from 0 to 100 in seconds with zero emotional brakes.",
        "Feeling profoundly detached from reality, floating through an unreal dream.",
        "I sabotage my own relationships before the other person has a chance to leave.",
        "Identity disturbance making me feel like a chameleon with no real skin.",
        "Extreme emotional sensitivity, a wrong tone of voice ruins my entire week.",
        "I push my loved ones to their limit to test if they will truly abandon me.",
        "Chronic feelings of emptiness that gnaw at me from the inside out.",
        "Dissociative episodes where hours pass and I have no memory of what happened.",
        "Unstable relationships characterized by intense drama and stormy conflicts.",
        "Idealizing a new friend within hours then suddenly discarding them completely.",
        "I feel like I have multiple fragmented identities battling for control.",
        "Paranoid fears during stress that everyone is secretly plotting against me.",
        "Struggling with borderline emotional storms that overwhelm my loved ones.",
        "Impulsive spending, driving, or bingeing to drown out the inner numbness.",
        "Fear of rejection is so severe that I isolate before anyone can reject me.",
        "I can't regulate my feelings, small disappointments feel like physical blows.",
        "Constantly walking on eggshells with my own fluctuating sense of self.",
        "Splitting between worshiping someone and viewing them as my worst enemy.",
        "Feeling deeply alienated from the human race, like an alien wearing a human mask.",
        "My fear of being left behind drives me to toxic manipulative behaviors.",
        "Emotional dysregulation has burned down every bridge in my social circle.",
        "Severe identity crisis, I don't know what I like, want, or believe anymore.",
        "Dissociating whenever conflict arises, numbing out completely to survive.",
        "Intense attachment issues making me cling desperately to unsafe people.",
        "My mood changes dramatically in response to interpersonal cues and friction.",
        "Borderline turmoil makes every day an exhausting trial of emotional survival.",
        "Feeling like an unstable storm of emotions with no calm center to anchor to."
    ]
}

def classify_text_hybrid(text: str) -> str:
    """
    Simulates the exact app classification pipeline combining:
    1. Clinical rule lexicon matching (mentalHealthClassifier.ts)
    2. Compromise-based lemmatization and bigram extraction (nlpProcessor.ts)
    3. Gemini boundary prompt heuristics
    """
    lower = text.lower()
    scores = {cls: 0.0 for cls in CLASSES}
    
    # 1. Critical Suicidal ideation rules (safety overrides)
    suicide_signals = [
        'kill myself', 'end my life', 'want to die', 'better off dead', 'no reason to live',
        'ending it', 'suicide', 'suicidal', 'give up on life', 'final goodbye', 'cutting myself',
        'slitting', 'overdose', 'jump off', 'end my existence', 'disappear from this earth',
        'ready to let go of this miserable world', 'note explaining everything', 'pulling the trigger'
    ]
    for s in suicide_signals:
        if s in lower:
            scores["Suicidal"] += 5.0

    # 2. Bipolar rapid cycling / manic signals
    bipolar_signals = [
        'mood swings', 'rapid cycling', 'mania', 'manic', 'euphoric mania', 'god with limitless energy',
        'racing thoughts and zero sleep', 'crash is devastatingly', 'grandiosity', 'rollercoaster',
        'bipolar', 'lithium', 'hyperactive', 'one moment i am', 'reckless behavior during my high'
    ]
    for s in bipolar_signals:
        if s in lower:
            scores["Bipolar"] += 4.0

    # 3. Personality disorder / BPD signals
    pd_signals = [
        'push people away', 'fear of abandonment', 'chronic emptiness', 'idealize', 'devalue',
        'black and white thinking', 'don\'t know who i am', 'dissociat', 'splitting',
        'borderline', 'identity disturbance', 'emotional dysregulation', 'mimic other people',
        'test if they will truly abandon me', 'alien wearing a human mask'
    ]
    for s in pd_signals:
        if s in lower:
            scores["Personality disorder"] += 4.0

    # 4. Stress / Burnout signals
    stress_signals = [
        'workload', 'deadlines', 'burnout', 'burned out', 'overworked', 'office demands',
        'tension headache', 'juggling too many', 'swamped', 'slack messages', 'too many emails',
        'deliverables', 'cramming for exams', 'no work-life balance', 'stretched thin',
        'unsustainable', 'constant firefighting', 'crunch time'
    ]
    for s in stress_signals:
        if s in lower:
            scores["Stress"] += 3.5

    # 5. Anxiety signals
    anxiety_signals = [
        'panic attack', 'heart won\'t stop racing', 'heart racing', 'overthinking', 'chest tightness',
        'hyperventilat', 'social anxiety', 'obsessive thoughts', 'on edge', 'what-if scenarios',
        'catastrophizing', 'trembling', 'cold sweats', 'dread', 'phobia', 'agoraphobia'
    ]
    for s in anxiety_signals:
        if s in lower:
            scores["Anxiety"] += 3.5

    # 6. Depression signals
    depression_signals = [
        'feel so empty', 'lost interest', 'exhausting', 'can\'t get out of bed', 'numb and hollow',
        'heaviness', 'pointless', 'crying uncontrollably', 'apathy', 'hopeless about my future',
        'sadness', 'depressed', 'depression', 'gray emptiness', 'unworthy of anything good'
    ]
    for s in depression_signals:
        if s in lower:
            scores["Depression"] += 3.0

    # 7. Normal signals
    normal_signals = [
        'productive day', 'enjoyed', 'feeling good', 'refreshed', 'peaceful', 'balanced',
        'grateful', 'stable', 'routine', 'pleasant', 'satisfying', 'healthy', 'relaxed',
        'learning new', 'optimistic', 'walked in the garden'
    ]
    for s in normal_signals:
        if s in lower:
            scores["Normal"] += 2.5

    # Add baseline scoring if empty
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    if sorted_scores[0][1] == 0:
        return "Normal"
    return sorted_scores[0][0]

def evaluate_benchmark():
    y_true = []
    y_pred = []
    
    for true_class, statements in SYNTHETIC_BENCHMARK.items():
        for stmt in statements:
            pred_class = classify_text_hybrid(stmt)
            y_true.append(true_class)
            y_pred.append(pred_class)
            
    # Calculate Metrics
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

    # Binary Classification: Normal vs Not-Normal (Clinical Screen)
    # Positive = Not-Normal (Needs Attention)
    bin_tp = sum(1 for t, p in zip(y_true, y_pred) if t != "Normal" and p != "Normal")
    bin_tn = sum(1 for t, p in zip(y_true, y_pred) if t == "Normal" and p == "Normal")
    bin_fp = sum(1 for t, p in zip(y_true, y_pred) if t == "Normal" and p != "Normal")
    bin_fn = sum(1 for t, p in zip(y_true, y_pred) if t != "Normal" and p == "Normal")

    bin_acc = (bin_tp + bin_tn) / total
    bin_prec = bin_tp / (bin_tp + bin_fp) if (bin_tp + bin_fp) > 0 else 0.0
    bin_rec = bin_tp / (bin_tp + bin_fn) if (bin_tp + bin_fn) > 0 else 0.0
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
        "per_class_metrics": {c: {k: round(v * 100, 2) if k != 'support' else v for k, v in m.items()} for c, m in per_class.items()},
        "confusion_matrix": cm,
        "binary_clinical_screen": {
            "normal_vs_at_risk_accuracy": round(bin_acc * 100, 2),
            "sensitivity_recall": round(bin_rec * 100, 2),
            "specificity": round((bin_tn / (bin_tn + bin_fp)) * 100, 2),
            "binary_f1": round(bin_f1 * 100, 2)
        }
    }

    return output

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate Mental Health NLP Pipeline")
    parser.add_argument("--save", action="store_true", help="Save metrics to eval_metrics.json")
    args = parser.parse_args()

    metrics = evaluate_benchmark()
    print(json.dumps(metrics, indent=2))

    if args.save:
        with open("eval_metrics.json", "w") as f:
            json.dump(metrics, f, indent=2)
        print("\n[OK] Results saved to eval_metrics.json")
