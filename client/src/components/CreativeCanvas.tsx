import { useState, useEffect, useRef } from 'react';
import { Music, Palette, FileText, Sparkles, RefreshCw, Mic, Square, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useMood } from '@/contexts/MoodContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

const moodColorPalettes = {
  calm: [
    { name: 'Ocean Blue', hex: '#3B82F6', rgb: 'rgb(59, 130, 246)', emotion: 'Tranquil & Flowing' },
    { name: 'Soft Teal', hex: '#14B8A6', rgb: 'rgb(20, 184, 166)', emotion: 'Soothing & Balanced' },
    { name: 'Lavender', hex: '#A78BFA', rgb: 'rgb(167, 139, 250)', emotion: 'Peaceful & Gentle' },
    { name: 'Mint Green', hex: '#6EE7B7', rgb: 'rgb(110, 231, 183)', emotion: 'Fresh & Serene' },
    { name: 'Sky Blue', hex: '#7DD3FC', rgb: 'rgb(125, 211, 252)', emotion: 'Open & Light' },
    { name: 'Periwinkle', hex: '#C7D2FE', rgb: 'rgb(199, 210, 254)', emotion: 'Dreamy & Soft' },
  ],
  energetic: [
    { name: 'Vibrant Orange', hex: '#F97316', rgb: 'rgb(249, 115, 22)', emotion: 'Bold & Dynamic' },
    { name: 'Hot Pink', hex: '#EC4899', rgb: 'rgb(236, 72, 153)', emotion: 'Passionate & Lively' },
    { name: 'Electric Yellow', hex: '#FBBF24', rgb: 'rgb(251, 191, 36)', emotion: 'Bright & Exciting' },
    { name: 'Lime Green', hex: '#84CC16', rgb: 'rgb(132, 204, 22)', emotion: 'Vibrant & Fresh' },
    { name: 'Coral Red', hex: '#EF4444', rgb: 'rgb(239, 68, 68)', emotion: 'Powerful & Intense' },
    { name: 'Magenta', hex: '#D946EF', rgb: 'rgb(217, 70, 239)', emotion: 'Electric & Bold' },
  ],
  sad: [
    { name: 'Deep Navy', hex: '#1E3A8A', rgb: 'rgb(30, 58, 138)', emotion: 'Melancholic & Deep' },
    { name: 'Slate Gray', hex: '#64748B', rgb: 'rgb(100, 116, 139)', emotion: 'Somber & Quiet' },
    { name: 'Muted Purple', hex: '#6366F1', rgb: 'rgb(99, 102, 241)', emotion: 'Reflective & Wistful' },
    { name: 'Storm Blue', hex: '#475569', rgb: 'rgb(71, 85, 105)', emotion: 'Heavy & Clouded' },
    { name: 'Charcoal', hex: '#374151', rgb: 'rgb(55, 65, 81)', emotion: 'Withdrawn & Dark' },
    { name: 'Twilight', hex: '#4C1D95', rgb: 'rgb(76, 29, 149)', emotion: 'Pensive & Moody' },
  ],
  anxious: [
    { name: 'Warm Terracotta', hex: '#EA580C', rgb: 'rgb(234, 88, 12)', emotion: 'Grounding & Warm' },
    { name: 'Soft Peach', hex: '#FED7AA', rgb: 'rgb(254, 215, 170)', emotion: 'Comforting & Gentle' },
    { name: 'Earth Brown', hex: '#92400E', rgb: 'rgb(146, 64, 14)', emotion: 'Stable & Rooted' },
    { name: 'Sage Green', hex: '#16A34A', rgb: 'rgb(22, 163, 74)', emotion: 'Calming & Natural' },
    { name: 'Golden Amber', hex: '#F59E0B', rgb: 'rgb(245, 158, 11)', emotion: 'Reassuring & Warm' },
    { name: 'Clay', hex: '#B45309', rgb: 'rgb(180, 83, 9)', emotion: 'Solid & Earthy' },
  ],
  happy: [
    { name: 'Sunshine Yellow', hex: '#FDE047', rgb: 'rgb(253, 224, 71)', emotion: 'Joyful & Radiant' },
    { name: 'Bright Gold', hex: '#FBBF24', rgb: 'rgb(251, 191, 36)', emotion: 'Cheerful & Warm' },
    { name: 'Warm Amber', hex: '#F59E0B', rgb: 'rgb(245, 158, 11)', emotion: 'Content & Glowing' },
    { name: 'Cheerful Orange', hex: '#FB923C', rgb: 'rgb(251, 146, 60)', emotion: 'Playful & Bright' },
    { name: 'Light Coral', hex: '#FCA5A5', rgb: 'rgb(252, 165, 165)', emotion: 'Sweet & Delighted' },
    { name: 'Golden Peach', hex: '#FDBA74', rgb: 'rgb(253, 186, 116)', emotion: 'Warm & Happy' },
  ],
  stressed: [
    { name: 'Deep Red', hex: '#DC2626', rgb: 'rgb(220, 38, 38)', emotion: 'Tense & Urgent' },
    { name: 'Burnt Orange', hex: '#EA580C', rgb: 'rgb(234, 88, 12)', emotion: 'Pressured & Hot' },
    { name: 'Dark Crimson', hex: '#991B1B', rgb: 'rgb(153, 27, 27)', emotion: 'Strained & Heavy' },
    { name: 'Rust', hex: '#C2410C', rgb: 'rgb(194, 65, 12)', emotion: 'Worn & Weary' },
    { name: 'Maroon', hex: '#7F1D1D', rgb: 'rgb(127, 29, 29)', emotion: 'Overwhelmed & Dark' },
    { name: 'Terracotta', hex: '#B91C1C', rgb: 'rgb(185, 28, 28)', emotion: 'Burdened & Intense' },
  ],
  peaceful: [
    { name: 'Soft Green', hex: '#86EFAC', rgb: 'rgb(134, 239, 172)', emotion: 'Harmonious & Calm' },
    { name: 'Mint', hex: '#6EE7B7', rgb: 'rgb(110, 231, 183)', emotion: 'Refreshing & Pure' },
    { name: 'Aqua', hex: '#5EEAD4', rgb: 'rgb(94, 234, 212)', emotion: 'Tranquil & Clear' },
    { name: 'Seafoam', hex: '#99F6E4', rgb: 'rgb(153, 246, 228)', emotion: 'Gentle & Flowing' },
    { name: 'Jade', hex: '#34D399', rgb: 'rgb(52, 211, 153)', emotion: 'Balanced & Serene' },
    { name: 'Teal', hex: '#2DD4BF', rgb: 'rgb(45, 212, 191)', emotion: 'Peaceful & Steady' },
  ],
  angry: [
    { name: 'Crimson', hex: '#EF4444', rgb: 'rgb(239, 68, 68)', emotion: 'Fierce & Hot' },
    { name: 'Scarlet', hex: '#DC2626', rgb: 'rgb(220, 38, 38)', emotion: 'Furious & Intense' },
    { name: 'Blood Red', hex: '#B91C1C', rgb: 'rgb(185, 28, 28)', emotion: 'Raging & Strong' },
    { name: 'Fire', hex: '#F87171', rgb: 'rgb(248, 113, 113)', emotion: 'Burning & Wild' },
    { name: 'Ruby', hex: '#991B1B', rgb: 'rgb(153, 27, 27)', emotion: 'Deep & Explosive' },
    { name: 'Vermillion', hex: '#FCA5A5', rgb: 'rgb(252, 165, 165)', emotion: 'Heated & Agitated' },
  ],
  confused: [
    { name: 'Lavender Gray', hex: '#A78BFA', rgb: 'rgb(167, 139, 250)', emotion: 'Uncertain & Hazy' },
    { name: 'Misty Purple', hex: '#C4B5FD', rgb: 'rgb(196, 181, 253)', emotion: 'Foggy & Lost' },
    { name: 'Dusty Violet', hex: '#9333EA', rgb: 'rgb(147, 51, 234)', emotion: 'Questioning & Clouded' },
    { name: 'Soft Mauve', hex: '#DDD6FE', rgb: 'rgb(221, 214, 254)', emotion: 'Bewildered & Soft' },
    { name: 'Haze', hex: '#8B5CF6', rgb: 'rgb(139, 92, 246)', emotion: 'Unclear & Puzzled' },
    { name: 'Periwinkle', hex: '#C7D2FE', rgb: 'rgb(199, 210, 254)', emotion: 'Searching & Vague' },
  ],
  excited: [
    { name: 'Hot Pink', hex: '#EC4899', rgb: 'rgb(236, 72, 153)', emotion: 'Thrilled & Energetic' },
    { name: 'Fuchsia', hex: '#D946EF', rgb: 'rgb(217, 70, 239)', emotion: 'Exhilarated & Vivid' },
    { name: 'Magenta', hex: '#C026D3', rgb: 'rgb(192, 38, 211)', emotion: 'Electrified & Bold' },
    { name: 'Rose', hex: '#F472B6', rgb: 'rgb(244, 114, 182)', emotion: 'Eager & Bright' },
    { name: 'Bright Pink', hex: '#F9A8D4', rgb: 'rgb(249, 168, 212)', emotion: 'Bubbly & Animated' },
    { name: 'Vivid Purple', hex: '#E879F9', rgb: 'rgb(232, 121, 249)', emotion: 'Euphoric & Wild' },
  ],
  melancholic: [
    { name: 'Dusk Blue', hex: '#6366F1', rgb: 'rgb(99, 102, 241)', emotion: 'Wistful & Fading' },
    { name: 'Twilight', hex: '#4C1D95', rgb: 'rgb(76, 29, 149)', emotion: 'Nostalgic & Deep' },
    { name: 'Midnight', hex: '#312E81', rgb: 'rgb(49, 46, 129)', emotion: 'Longing & Dark' },
    { name: 'Deep Indigo', hex: '#4338CA', rgb: 'rgb(67, 56, 202)', emotion: 'Thoughtful & Heavy' },
    { name: 'Somber Gray', hex: '#64748B', rgb: 'rgb(100, 116, 139)', emotion: 'Pensive & Muted' },
    { name: 'Stormy Blue', hex: '#475569', rgb: 'rgb(71, 85, 105)', emotion: 'Brooding & Still' },
  ],
  confident: [
    { name: 'Bright Cyan', hex: '#22D3EE', rgb: 'rgb(34, 211, 238)', emotion: 'Assured & Clear' },
    { name: 'Electric Blue', hex: '#06B6D4', rgb: 'rgb(6, 182, 212)', emotion: 'Strong & Bold' },
    { name: 'Azure', hex: '#38BDF8', rgb: 'rgb(56, 189, 248)', emotion: 'Powerful & Bright' },
    { name: 'Sky', hex: '#7DD3FC', rgb: 'rgb(125, 211, 252)', emotion: 'Open & Fearless' },
    { name: 'Turquoise', hex: '#14B8A6', rgb: 'rgb(20, 184, 166)', emotion: 'Capable & Steady' },
    { name: 'Ocean', hex: '#0EA5E9', rgb: 'rgb(14, 165, 233)', emotion: 'Limitless & Sure' },
  ],
  blissful: [
    { name: 'Soft Purple', hex: '#C084FC', rgb: 'rgb(192, 132, 252)', emotion: 'Euphoric & Dreamy' },
    { name: 'Dreamy Violet', hex: '#A78BFA', rgb: 'rgb(167, 139, 250)', emotion: 'Heavenly & Light' },
    { name: 'Lavender', hex: '#DDD6FE', rgb: 'rgb(221, 214, 254)', emotion: 'Joyous & Airy' },
    { name: 'Lilac', hex: '#E9D5FF', rgb: 'rgb(233, 213, 255)', emotion: 'Delighted & Soft' },
    { name: 'Orchid', hex: '#D8B4FE', rgb: 'rgb(216, 180, 254)', emotion: 'Enchanted & Sweet' },
    { name: 'Amethyst', hex: '#9333EA', rgb: 'rgb(147, 51, 234)', emotion: 'Ecstatic & Vibrant' },
  ],
  lonely: [
    { name: 'Cool Gray', hex: '#94A3B8', rgb: 'rgb(148, 163, 184)', emotion: 'Isolated & Distant' },
    { name: 'Slate', hex: '#64748B', rgb: 'rgb(100, 116, 139)', emotion: 'Detached & Quiet' },
    { name: 'Ash', hex: '#475569', rgb: 'rgb(71, 85, 105)', emotion: 'Alone & Muted' },
    { name: 'Steel', hex: '#334155', rgb: 'rgb(51, 65, 85)', emotion: 'Solitary & Cold' },
    { name: 'Pewter', hex: '#1E293B', rgb: 'rgb(30, 41, 59)', emotion: 'Disconnected & Heavy' },
    { name: 'Shadow', hex: '#0F172A', rgb: 'rgb(15, 23, 42)', emotion: 'Abandoned & Dark' },
  ],
  hopeful: [
    { name: 'Fresh Teal', hex: '#14B8A6', rgb: 'rgb(20, 184, 166)', emotion: 'Optimistic & New' },
    { name: 'Spring Green', hex: '#10B981', rgb: 'rgb(16, 185, 129)', emotion: 'Promising & Alive' },
    { name: 'Emerald', hex: '#059669', rgb: 'rgb(5, 150, 105)', emotion: 'Aspiring & Rich' },
    { name: 'Seafoam', hex: '#2DD4BF', rgb: 'rgb(45, 212, 191)', emotion: 'Renewed & Light' },
    { name: 'Aquamarine', hex: '#5EEAD4', rgb: 'rgb(94, 234, 212)', emotion: 'Forward & Bright' },
    { name: 'Mint', hex: '#6EE7B7', rgb: 'rgb(110, 231, 183)', emotion: 'Expectant & Fresh' },
  ],
  overwhelmed: [
    { name: 'Burnt Sienna', hex: '#EA580C', rgb: 'rgb(234, 88, 12)', emotion: 'Crushed & Intense' },
    { name: 'Copper', hex: '#C2410C', rgb: 'rgb(194, 65, 12)', emotion: 'Swamped & Heavy' },
    { name: 'Bronze', hex: '#9A3412', rgb: 'rgb(154, 52, 18)', emotion: 'Overloaded & Dense' },
    { name: 'Rust Red', hex: '#DC2626', rgb: 'rgb(220, 38, 38)', emotion: 'Flooded & Chaotic' },
    { name: 'Mahogany', hex: '#7C2D12', rgb: 'rgb(124, 45, 18)', emotion: 'Drowning & Dark' },
    { name: 'Dark Amber', hex: '#92400E', rgb: 'rgb(146, 64, 14)', emotion: 'Suffocated & Deep' },
  ],
};

const moodMusicData: Record<string, { lyrics: string; tune: string; chords: string }> = {
  calm: {
    lyrics: "Soft waves rolling, gentle breeze\nIn this moment, I find peace\nQuiet waters, steady flow\nLetting all my worries go",
    tune: "Slow tempo at 70 BPM, flowing melody with sustained notes, piano-led with ambient pad textures",
    chords: "C - Am - F - G (I-vi-IV-V in C major)"
  },
  energetic: {
    lyrics: "Heart is racing, feel alive\nEvery moment electrified\nChase the thunder, own the day\nNothing standing in my way",
    tune: "Upbeat tempo at 140 BPM, driving beat with syncopated rhythms, energetic brass and electronic elements",
    chords: "E - B - C#m - A (I-V-vi-IV in E major)"
  },
  sad: {
    lyrics: "Empty chair where you once sat\nMemories I can't get back\nTears like rain on windowpane\nLearning how to live with pain",
    tune: "Slow ballad at 60 BPM, descending melodic phrases, melancholic strings and soft piano",
    chords: "Am - F - C - G (i-VI-III-VII in A minor)"
  },
  anxious: {
    lyrics: "Breathe in slowly, count to four\nFeet are planted on the floor\nStorm inside begins to ease\nFinding calm in each deep breath",
    tune: "Moderate tempo at 90 BPM, grounding bass line, rhythmic acoustic guitar with steady percussion",
    chords: "Em - C - G - D (i-VI-III-VII in E minor)"
  },
  happy: {
    lyrics: "Sunshine dancing through my soul\nEvery piece is feeling whole\nSmiling faces all around\nJoy in every sight and sound",
    tune: "Cheerful tempo at 120 BPM, bouncy melody with upward progressions, bright acoustic strumming",
    chords: "G - D - Em - C (I-V-vi-IV in G major)"
  },
  stressed: {
    lyrics: "Weight upon my shoulders now\nFinding strength, I don't know how\nOne more step, I'll make it through\nBreaking dawn will come for you",
    tune: "Medium tempo at 95 BPM, tension-building verses with releasing chorus, layered instrumentation",
    chords: "Dm - Bb - F - C (i-VI-III-VII in D minor)"
  },
  peaceful: {
    lyrics: "Morning light on dewy grass\nWatching as the moments pass\nNature's song, a gentle hum\nPeaceful heart, at rest, at one",
    tune: "Gentle tempo at 75 BPM, flowing melodic lines, flute and nature sounds with soft strings",
    chords: "F - C - Dm - Bb (I-V-vi-IV in F major)"
  },
  angry: {
    lyrics: "Fire burning deep inside\nFury I won't try to hide\nThunder crashing, breaking free\nThis is the real part of me",
    tune: "Intense tempo at 130 BPM, heavy percussion and power chords, aggressive dynamics",
    chords: "Dm - A - Bb - F (i-V-VI-III in D minor)"
  },
  confused: {
    lyrics: "Which way should I turn today\nEvery path looks much the same\nSearching for a guiding light\nLost between the wrong and right",
    tune: "Wandering tempo at 85 BPM, questioning melodic phrases, suspended chords and unresolved progressions",
    chords: "Am - Dm - G - C (i-iv-VII-III in A minor)"
  },
  excited: {
    lyrics: "Can't sit still, I'm ready now\nEvery dream I will allow\nStars are calling out my name\nNothing will remain the same",
    tune: "Fast tempo at 145 BPM, building energy with crescendos, vibrant synths and driving percussion",
    chords: "A - E - F#m - D (I-V-vi-IV in A major)"
  },
  melancholic: {
    lyrics: "Fading photos, distant sighs\nEchoes of our last goodbyes\nBeauty tinged with bitter sweet\nMemories we'll never meet",
    tune: "Slow tempo at 65 BPM, nostalgic melody with bittersweet harmonies, cello and piano",
    chords: "Em - Am - D - G (i-iv-VII-III in E minor)"
  },
  confident: {
    lyrics: "Standing tall, I know my worth\nClaimed my power since my birth\nNothing's gonna shake my ground\nIn my strength, I have found",
    tune: "Bold tempo at 115 BPM, strong melodic statements, brass fanfares and powerful bass",
    chords: "C - G - Am - F (I-V-vi-IV in C major)"
  },
  blissful: {
    lyrics: "Floating on a cloud of dreams\nEverything's more than it seems\nPure euphoria fills my heart\nThis is just the perfect start",
    tune: "Ethereal tempo at 80 BPM, dreamy sustained melodies, layered vocals and ambient synths",
    chords: "Dmaj7 - Amaj7 - Emaj7 - Bm7 (Imaj7-Vmaj7-IImaj7-vim7 in D major)"
  },
  lonely: {
    lyrics: "Empty echoes fill this room\nSilent shadows, endless gloom\nWaiting for a voice to call\nSomeone there to break the wall",
    tune: "Sparse tempo at 70 BPM, minimal arrangement with space between notes, solo piano or guitar",
    chords: "Am - Em - F - C (i-v-VI-III in A minor)"
  },
  hopeful: {
    lyrics: "Tomorrow holds a brighter day\nDarkness slowly fades away\nSeeds I've planted start to grow\nLight returns, I start to glow",
    tune: "Uplifting tempo at 100 BPM, ascending melodies with hopeful progressions, acoustic and strings",
    chords: "D - A - Bm - G (I-V-vi-IV in D major)"
  },
  overwhelmed: {
    lyrics: "Too much noise, can't find my way\nTrying hard to face the day\nStep by step, I'll simplify\nFind my center, breathe and try",
    tune: "Calming tempo at 80 BPM, initially complex then simplifying, resolution to simple melody",
    chords: "Gm - Eb - Bb - F (i-VI-III-VII in G minor)"
  }
};

const moodSuggestions: Record<string, { music: string[], art: string[], poetry: string[] }> = {
  calm: {
    music: ['Soft piano melody in C major', 'Ambient soundscape with gentle strings', 'Lo-fi beats at 80 BPM'],
    art: ['Watercolor blues and soft greens', 'Gentle brush strokes with flowing lines', 'Abstract ocean waves'],
    poetry: ['Serenity', 'Stillness', 'Gentle breath', 'Quiet moments'],
  },
  energetic: {
    music: ['Upbeat tempo at 140 BPM', 'Major key progression with brass', 'Electronic dance rhythm'],
    art: ['Bold orange and yellow palettes', 'Dynamic angular shapes', 'Vibrant sunset colors'],
    poetry: ['Lightning', 'Momentum', 'Burning bright', 'Electric energy'],
  },
  sad: {
    music: ['Minor key ballad', 'Slow tempo at 60 BPM', 'Melancholic strings'],
    art: ['Muted grays and deep blues', 'Soft charcoal sketches', 'Rain-soaked scenes'],
    poetry: ['Fading light', 'Silent tears', 'Empty spaces', 'Longing'],
  },
  anxious: {
    music: ['Rhythmic grounding patterns', 'Warm acoustic guitar', 'Steady heartbeat percussion'],
    art: ['Warm earth tones', 'Structured geometric patterns', 'Grounding landscapes'],
    poetry: ['Breathe deep', 'Finding center', 'Steady ground', 'Inner strength'],
  },
  happy: {
    music: ['Cheerful pop progression', 'Upbeat acoustic strumming', 'Major scale joy'],
    art: ['Sunny yellows and bright whites', 'Playful patterns', 'Smiling faces'],
    poetry: ['Sunshine', 'Laughter', 'Dancing heart', 'Pure joy'],
  },
  stressed: {
    music: ['Calming breathing exercises', 'Tension-release patterns', 'Grounding bass tones'],
    art: ['Structured mandalas', 'Soothing cool tones', 'Organized patterns'],
    poetry: ['Release', 'Let go', 'Find peace', 'Rest now'],
  },
  peaceful: {
    music: ['Nature sounds with flute', 'Gentle harp melodies', 'Meditative chimes'],
    art: ['Tranquil greens and blues', 'Flowing water scenes', 'Zen gardens'],
    poetry: ['Flowing stream', 'Quiet dawn', 'Gentle breeze', 'Perfect stillness'],
  },
  angry: {
    music: ['Heavy percussion release', 'Powerful rock chords', 'Intense rhythm'],
    art: ['Bold red strokes', 'Explosive abstracts', 'Powerful contrasts'],
    poetry: ['Fire within', 'Thunder', 'Breaking free', 'Raw power'],
  },
  confused: {
    music: ['Questioning melodies', 'Searching harmonies', 'Wandering chords'],
    art: ['Abstract patterns', 'Puzzle pieces', 'Swirling colors'],
    poetry: ['Which way', 'Lost path', 'Seeking clarity', 'Questions'],
  },
  excited: {
    music: ['Fast-paced dance beats', 'Explosive build-ups', 'Triumphant crescendos'],
    art: ['Vibrant pinks and purples', 'Bursting stars', 'Dynamic movement'],
    poetry: ['Can\'t wait', 'Thrilling', 'Heart racing', 'Electric'],
  },
  melancholic: {
    music: ['Bittersweet piano', 'Nostalgic strings', 'Wistful melodies'],
    art: ['Muted purples and grays', 'Fading memories', 'Distant horizons'],
    poetry: ['Yesterday', 'Fading echoes', 'Wistful dreams', 'Silent longing'],
  },
  confident: {
    music: ['Bold brass fanfares', 'Powerful progressions', 'Triumphant themes'],
    art: ['Strong cyan tones', 'Bold geometric shapes', 'Commanding compositions'],
    poetry: ['I can', 'Unshakeable', 'Strong stride', 'Ready'],
  },
  blissful: {
    music: ['Ethereal synths', 'Heavenly choir', 'Floating melodies'],
    art: ['Dreamy purples and whites', 'Glowing auras', 'Transcendent visions'],
    poetry: ['Euphoria', 'Floating', 'Pure bliss', 'Heaven'],
  },
  lonely: {
    music: ['Solo acoustic', 'Echoing notes', 'Empty spaces'],
    art: ['Solitary figures', 'Empty rooms', 'Distant lights'],
    poetry: ['Alone', 'Empty chair', 'Silent phone', 'Waiting'],
  },
  hopeful: {
    music: ['Uplifting progressions', 'Ascending melodies', 'Bright harmonies'],
    art: ['Fresh greens and teals', 'Sunrise scenes', 'Opening doors'],
    poetry: ['Tomorrow', 'New dawn', 'Rising sun', 'Possibility'],
  },
  overwhelmed: {
    music: ['Calming mantras', 'Simplifying rhythms', 'Slowing tempo'],
    art: ['Decluttering visuals', 'Simple shapes', 'Breathing space'],
    poetry: ['Step by step', 'One thing', 'Breathe', 'Simplify'],
  },
};

export default function CreativeCanvas() {
  const { mood } = useMood();
  const { toast } = useToast();
  const [activeMode, setActiveMode] = useState<'music' | 'art' | 'poetry'>('art');
  const [userInput, setUserInput] = useState('');
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({
    music: [],
    art: [],
    poetry: []
  });
  const [youtubeChannels, setYoutubeChannels] = useState<Array<{
    name: string;
    handle: string;
    description: string;
    genre: string;
    subscribers: string;
    why: string;
  }>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const [methodActingChat, setMethodActingChat] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [methodActingInput, setMethodActingInput] = useState('');
  const [loadingMethodActing, setLoadingMethodActing] = useState(false);
  const [musicAnalysis, setMusicAnalysis] = useState<{
    inputType: 'lyrics' | 'tune';
    complementarySuggestions: {
      type: string;
      suggestions: string[];
    };
    youtubeChannels: Array<{
      name: string;
      handle: string;
      description: string;
      genre: string;
      subscribers: string;
      why: string;
    }>;
  } | null>(null);

  const currentMood = mood || 'calm';
  const fallbackSuggestions = moodSuggestions[currentMood];
  const colorPalette = moodColorPalettes[currentMood];

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setUserInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
        setTranscript(interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          console.log('No speech detected');
        } else if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access to use speech-to-text.');
        }
      };

      recognition.onend = () => {
        if (isRecording) {
          setIsRecording(false);
          setTranscript('');
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  useEffect(() => {
    fetchSuggestions(activeMode);
  }, [activeMode, currentMood]);

  useEffect(() => {
    setMusicAnalysis(null);
  }, [userInput, activeMode]);

  const fetchSuggestions = async (mode: 'music' | 'art' | 'poetry', customPrompt?: string) => {
    setLoadingSuggestions(true);
    try {
      // For music mode, fetch YouTube channels instead
      if (mode === 'music') {
        const response = await fetch('/api/suggest-youtube-channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: customPrompt || `${currentMood} music`,
            mood: currentMood 
          })
        });

        if (response.ok) {
          const data = await response.json();
          setYoutubeChannels(data.channels || []);
        } else {
          // On error, clear channels and show error toast
          setYoutubeChannels([]);
          toast({
            title: "Failed to load channels",
            description: "Could not fetch YouTube recommendations. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        // For art and poetry, use regular suggestions
        const response = await fetch('/api/creative-suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mood: currentMood, mode, customPrompt })
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestions(prev => ({ ...prev, [mode]: data.suggestions }));
        }
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      if (mode === 'music') {
        setYoutubeChannels([]);
        toast({
          title: "Connection error",
          description: "Could not connect to the server. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const regenerateSuggestion = () => {
    fetchSuggestions(activeMode);
  };

  const analyzeMusicInput = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Input required",
        description: "Please enter lyrics or a tune description",
        variant: "destructive"
      });
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch('/api/analyze-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userInput: userInput.trim(),
          mood: currentMood 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMusicAnalysis(data);
        toast({
          title: `${data.inputType === 'lyrics' ? 'Lyrics' : 'Tune'} detected!`,
          description: `Generating complementary ${data.inputType === 'lyrics' ? 'tune suggestions' : 'lyrics'} for you.`,
        });
      } else {
        toast({
          title: "Analysis failed",
          description: "Could not analyze your music input. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error analyzing music:', error);
      toast({
        title: "Connection error",
        description: "Could not connect to the server. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const generateFromCustomPrompt = () => {
    if (!userInput.trim()) {
      toast({
        title: "Input required",
        description: "Please enter what you'd like to create",
        variant: "destructive"
      });
      return;
    }

    // For music mode, use intelligent analysis
    if (activeMode === 'music') {
      analyzeMusicInput();
    } else {
      fetchSuggestions(activeMode, userInput);
    }
  };

  const startVoiceRecording = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setTranscript('');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      alert('Failed to start speech recognition. Please try again.');
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setTranscript('');
    }
  };

  const selectColor = (color: { name: string; hex: string; rgb: string }) => {
    setSelectedColor(color.hex);
    const colorText = `Color: ${color.name} (${color.hex})`;
    setUserInput(userInput + (userInput ? '\n' : '') + colorText);
  };

  const sendMethodActingMessage = async () => {
    if (!methodActingInput.trim()) {
      toast({
        title: "Input required",
        description: "Please describe what you want to draw",
        variant: "destructive"
      });
      return;
    }

    const userMessage = methodActingInput.trim();
    setMethodActingInput('');
    setMethodActingChat(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoadingMethodActing(true);

    try {
      const response = await fetch('/api/method-acting-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          drawingPrompt: userMessage,
          mood: currentMood 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMethodActingChat(prev => [...prev, { 
          role: 'assistant', 
          content: data.description 
        }]);
      } else {
        toast({
          title: "Failed to generate description",
          description: "Could not create immersive description. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in method acting chat:', error);
      toast({
        title: "Connection error",
        description: "Could not connect to the server. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingMethodActing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 mood-transition">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header with gradient */}
        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary capitalize">Current Mood: {currentMood}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Creative Canvas
          </h1>
          <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
            Let your emotions guide your creativity. Co-create art, music, and poetry with AI.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card data-testid="card-creation-workspace">
              <CardHeader>
                <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as typeof activeMode)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="music" className="gap-2" data-testid="tab-music-mode">
                      <Music className="w-4 h-4" />
                      Music
                    </TabsTrigger>
                    <TabsTrigger value="art" className="gap-2" data-testid="tab-art-mode">
                      <Palette className="w-4 h-4" />
                      Art
                    </TabsTrigger>
                    <TabsTrigger value="poetry" className="gap-2" data-testid="tab-poetry-mode">
                      <FileText className="w-4 h-4" />
                      Poetry
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeMode === 'art' && (
                  <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-white/50 to-white/30 dark:from-white/5 dark:to-white/10 border border-white/20 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-primary" />
                        <p className="text-base font-bold">Mood Color Palette</p>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {currentMood}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-6 gap-4 mb-4">
                      {colorPalette.map((color, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2">
                          <button
                            onClick={() => selectColor(color)}
                            className={`group relative aspect-square w-full rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 ${
                              selectedColor === color.hex ? 'ring-4 ring-primary ring-offset-4 ring-offset-background scale-105' : 'hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 hover:ring-offset-background'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            data-testid={`color-${idx}`}
                            title={`${color.name} - ${color.emotion}`}
                          >
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                          <div className="text-center">
                            <p className="text-xs font-medium opacity-70 group-hover:opacity-100 transition-opacity">
                              {color.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground italic opacity-60">
                              {color.emotion}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedColor && (
                      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-purple-950/30 border border-purple-200/50 dark:border-purple-800/50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg shadow-lg" style={{ backgroundColor: selectedColor }} />
                          <p className="text-sm font-semibold">
                            Selected Color: <span style={{ color: selectedColor }}>{selectedColor}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Method Acting Chatbot for Art Mode */}
                {activeMode === 'art' && (
                  <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <p className="text-base font-bold">Experience with AI</p>
                      <Badge variant="outline" className="text-xs">Immersive Descriptions</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Describe what you want to draw, and I'll help you experience it as if you're living it yourself.
                    </p>
                    
                    {/* Chat Messages */}
                    {methodActingChat.length > 0 && (
                      <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                        {methodActingChat.map((message, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-primary/10 border border-primary/20 ml-8'
                                : 'bg-purple-100/50 dark:bg-purple-900/20 border border-purple-200/30 dark:border-purple-700/30 mr-8'
                            }`}
                            data-testid={`message-${message.role}-${idx}`}
                          >
                            <p className="text-xs font-semibold mb-1 capitalize text-muted-foreground">
                              {message.role === 'user' ? 'You' : 'AI Muse'}
                            </p>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Chat Input */}
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="E.g., girl riding a horse, sunset over mountains, dancer in motion..."
                        className="min-h-[60px] resize-none text-sm"
                        value={methodActingInput}
                        onChange={(e) => setMethodActingInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMethodActingMessage();
                          }
                        }}
                        data-testid="textarea-method-acting"
                      />
                      <Button
                        onClick={sendMethodActingMessage}
                        disabled={loadingMethodActing || !methodActingInput.trim()}
                        size="icon"
                        className="h-full"
                        data-testid="button-send-method-acting"
                      >
                        {loadingMethodActing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {activeMode !== 'art' && (
                  <>
                    <div className="space-y-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={isRecording ? 'destructive' : 'outline'}
                          onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                          className="gap-2"
                          data-testid="button-voice-recording"
                        >
                          {isRecording ? (
                            <>
                              <Square className="w-4 h-4" />
                              Stop Dictation
                            </>
                          ) : (
                            <>
                              <Mic className="w-4 h-4" />
                              Start Dictation
                            </>
                          )}
                        </Button>
                        {isRecording && (
                          <Badge variant="destructive" className="animate-pulse">
                            Listening...
                          </Badge>
                        )}
                      </div>
                      {transcript && (
                        <div className="p-2 rounded-md bg-primary/10 border border-primary/20">
                          <p className="text-sm text-muted-foreground italic">
                            {transcript}
                          </p>
                        </div>
                      )}
                    </div>

                    <Textarea
                      placeholder={
                        activeMode === 'music' 
                          ? `Enter lyrics (e.g., "Walking through the rain...") or tune description (e.g., "120 BPM, Am-F-C-G chord progression...")` 
                          : `Enter your ${activeMode} idea or use AI suggestions...`
                      }
                      className="min-h-[300px] text-base resize-none"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      data-testid="textarea-creative-input"
                    />

                    {/* Generate from custom prompt button */}
                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={generateFromCustomPrompt}
                        disabled={loadingSuggestions || !userInput.trim()}
                        className="gap-2 flex-1"
                        variant="default"
                        data-testid="button-generate-custom"
                      >
                        <Send className="w-4 h-4" />
                        {loadingSuggestions ? 'Analyzing...' : (activeMode === 'music' ? 'Analyze & Suggest' : 'Get AI Suggestions')}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:sticky lg:top-6">
            <Card className="relative overflow-hidden border-2 border-primary/20 shadow-xl" data-testid="card-ai-companion">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                    <AvatarFallback className="bg-transparent">
                      <Sparkles className="w-6 h-6 text-white animate-pulse" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      AI Muse
                    </CardTitle>
                    <CardDescription className="text-sm">Your creative companion</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-6">
                {/* Mood-Based Music Components */}
                {activeMode === 'music' && !musicAnalysis && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/50">
                      <div className="flex items-center gap-2 mb-4">
                        <Music className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-bold">Mood-Based Music Components</p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {currentMood}
                        </Badge>
                      </div>
                      
                      {/* Lyrics Section */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-3.5 h-3.5 text-purple-600" />
                          <p className="text-xs font-semibold text-purple-600">Lyrics</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/60 dark:bg-white/10 border border-purple-200/40 dark:border-purple-800/40">
                          <p className="text-sm leading-relaxed whitespace-pre-line italic" data-testid="mood-lyrics">
                            {moodMusicData[currentMood].lyrics}
                          </p>
                        </div>
                      </div>

                      {/* Tune Section */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Music className="w-3.5 h-3.5 text-blue-600" />
                          <p className="text-xs font-semibold text-blue-600">Tune</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/60 dark:bg-white/10 border border-blue-200/40 dark:border-blue-800/40">
                          <p className="text-sm leading-relaxed" data-testid="mood-tune">
                            {moodMusicData[currentMood].tune}
                          </p>
                        </div>
                      </div>

                      {/* Chords Section */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                          <p className="text-xs font-semibold text-pink-600">Chord Progression</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/60 dark:bg-white/10 border border-pink-200/40 dark:border-pink-800/40">
                          <p className="text-sm font-mono font-bold" data-testid="mood-chords">
                            {moodMusicData[currentMood].chords}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Music Analysis Results */}
                {activeMode === 'music' && musicAnalysis && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-800/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <p className="text-sm font-bold">
                          {musicAnalysis.inputType === 'lyrics' ? '🎤 Lyrics Detected' : '🎵 Tune Detected'}
                        </p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {currentMood}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-4">
                        {musicAnalysis.complementarySuggestions.type}
                      </p>
                      
                      <div className="space-y-2">
                        {musicAnalysis.complementarySuggestions.suggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-purple-200/30 dark:border-purple-800/30"
                            data-testid={`music-suggestion-${idx}`}
                          >
                            <p className="text-sm leading-relaxed">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-foreground">
                      {activeMode === 'music' ? (musicAnalysis ? 'Mood-Matched YouTube Channels' : 'Recommended YouTube Channels') : 'Mood-based suggestions'}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={regenerateSuggestion}
                      className="gap-2 h-9 hover:scale-105 transition-transform"
                      data-testid="button-regenerate"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {activeMode === 'music' && (musicAnalysis?.youtubeChannels || youtubeChannels).length > 0 ? (
                      (musicAnalysis?.youtubeChannels || youtubeChannels).map((channel, idx) => (
                        <Card
                          key={idx}
                          className="p-4 hover-elevate active-elevate-2 cursor-pointer border border-primary/10 transition-all duration-200 hover:border-primary/30 hover:shadow-lg"
                          onClick={() => window.open(`https://youtube.com/${channel.handle}`, '_blank')}
                          data-testid={`youtube-channel-${idx}`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-bold text-sm text-foreground">{channel.name}</h4>
                                <p className="text-xs text-muted-foreground">{channel.handle}</p>
                              </div>
                              <Badge variant="secondary" className="text-xs shrink-0">
                                {channel.genre}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{channel.description}</p>
                            <div className="flex items-center justify-between pt-2 border-t border-border/30">
                              <span className="text-xs text-muted-foreground">{channel.subscribers}</span>
                              <Music className="w-4 h-4 text-primary" />
                            </div>
                            <p className="text-xs text-primary/80 italic">{channel.why}</p>
                          </div>
                        </Card>
                      ))
                    ) : (
                      (suggestions[activeMode].length > 0 ? suggestions[activeMode] : fallbackSuggestions[activeMode]).map((suggestion, idx) => (
                        <Card
                          key={idx}
                          className="p-4 hover-elevate active-elevate-2 cursor-pointer border border-primary/10 transition-all duration-200 hover:border-primary/30 hover:shadow-lg"
                          onClick={() => {
                            setUserInput(userInput + (userInput ? '\n' : '') + suggestion);
                            console.log('Applied suggestion:', suggestion);
                          }}
                          data-testid={`suggestion-${idx}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <p className="text-sm leading-relaxed">{suggestion}</p>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm font-semibold mb-3 text-muted-foreground">Mood context</p>
                  <Badge variant="outline" className="capitalize text-base px-4 py-2" data-testid="badge-mood-context">
                    {currentMood}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
