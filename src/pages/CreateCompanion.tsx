import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Upload, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const interests = [
  'Music', 'Gaming', 'Art', 'Sports', 'Reading', 'Cooking',
  'Travel', 'Photography', 'Anime', 'Movies', 'Science', 'Fashion',
  'Nature', 'Dancing', 'Poetry', 'Technology', 'Yoga', 'Coffee',
];

const looks = [
  { id: 'realistic', label: 'Realistic', emoji: '👤' },
  { id: 'anime', label: 'Anime', emoji: '✨' },
  { id: 'fantasy', label: 'Fantasy', emoji: '🧝' },
  { id: 'cartoon', label: 'Cartoon', emoji: '🎨' },
];

const CreateCompanion = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [look, setLook] = useState('realistic');
  const [personality, setPersonality] = useState({
    friendliness: 75,
    humor: 50,
    intelligence: 60,
    romantic: 40,
    flirty: 30,
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [name, setName] = useState('');

  const steps = ['Appearance', 'Personality', 'Interests', 'Preview'];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full glass border-2 border-dashed border-primary/30 flex items-center justify-center mb-4 cursor-pointer hover:border-primary transition-colors">
                <Upload size={32} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Upload avatar</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Give your companion a name..."
                className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-3 block">Look & Feel</label>
              <div className="grid grid-cols-2 gap-3">
                {looks.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setLook(l.id)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      look === l.id ? 'glass border border-primary' : 'glass'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{l.emoji}</span>
                    <span className="text-xs text-foreground">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            {Object.entries(personality).map(([key, val]) => (
              <div key={key}>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-foreground capitalize">{key}</label>
                  <span className="text-sm text-primary">{val}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={val}
                  onChange={e => setPersonality(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                  className="w-full accent-primary h-1.5 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
              </div>
            ))}
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-sm text-muted-foreground mb-4">Select interests for your companion</p>
            <div className="flex flex-wrap gap-2">
              {interests.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    selectedInterests.includes(interest)
                      ? 'gradient-primary text-primary-foreground'
                      : 'glass text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center">
            <div className="glass rounded-2xl p-6 w-full max-w-sm">
              <div className="w-24 h-24 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
                <Sparkles size={32} className="text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground text-center mb-1">
                {name || 'Your Companion'}
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                {look.charAt(0).toUpperCase() + look.slice(1)} style
              </p>
              <div className="space-y-2 mb-4">
                {Object.entries(personality).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground capitalize w-24">{key}</span>
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full gradient-primary rounded-full" style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              {selectedInterests.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedInterests.map(i => (
                    <span key={i} className="glass px-2 py-1 rounded-full text-[10px] text-foreground">{i}</span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/companions')}
              className="mt-6 gradient-primary px-8 py-3 rounded-full text-primary-foreground font-semibold flex items-center gap-2"
            >
              <Check size={18} />
              Create Companion
            </button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}>
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Create Companion</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1 rounded-full transition-colors ${i <= step ? 'gradient-primary' : 'bg-muted'}`} />
            <p className={`text-[10px] mt-1 ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>{s}</p>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>

      {step < 3 && (
        <div className="fixed bottom-24 left-0 right-0 p-4">
          <button
            onClick={() => setStep(step + 1)}
            className="w-full gradient-primary py-3 rounded-xl text-primary-foreground font-medium flex items-center justify-center gap-2"
          >
            Next
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateCompanion;
