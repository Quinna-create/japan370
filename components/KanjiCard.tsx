'use client';

/**
 * Reusable Kanji Card component with story editing, stroke count, and stroke order animation
 */

import { useState, useEffect, useRef } from 'react';
import { Save, Loader2, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Kanji } from '@/types/kanji';
import { getStudentSession } from '@/lib/storage';
import { getStory, saveStory } from '@/lib/storage';

interface KanjiCardProps {
  kanji: Kanji;
  showStory?: boolean;
  editableStory?: boolean;
}

export default function KanjiCard({ kanji, showStory = true, editableStory = true }: KanjiCardProps) {
  const [story, setStory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showStrokeOrder, setShowStrokeOrder] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(0);
  const strokeOrderRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = getStudentSession();
    if (session) {
      const userStory = getStory(session.userId, kanji.id);
      setStory(userStory);
    }
  }, [kanji.id]);

  // Load dmak library and initialize stroke order animation
  useEffect(() => {
    if (showStrokeOrder && containerRef.current) {
      loadStrokeOrderAnimation();
    }
    
    return () => {
      if (strokeOrderRef.current) {
        // Cleanup if needed
        strokeOrderRef.current = null;
      }
    };
  }, [showStrokeOrder, kanji.kanji]);

  const loadStrokeOrderAnimation = async () => {
    try {
      // Dynamically import dmak
      const Dmak = (await import('dmak')).default;
      
      if (containerRef.current) {
        // Clear previous content
        containerRef.current.innerHTML = '';
        
        // Create dmak instance
        strokeOrderRef.current = new Dmak(kanji.kanji, {
          element: containerRef.current,
          uri: 'https://cdn.jsdelivr.net/npm/dmak@2.0.0/dist/',
          stroke: {
            order: {
              visible: true,
              attr: {
                'font-size': 12,
                fill: '#666'
              }
            }
          },
          autoplay: false,
          height: 200,
          width: 200,
        });
        
        setCurrentStroke(0);
      }
    } catch (error) {
      console.error('Error loading stroke order:', error);
    }
  };

  const handlePlay = () => {
    if (strokeOrderRef.current) {
      if (isPlaying) {
        strokeOrderRef.current.pause();
      } else {
        strokeOrderRef.current.render();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    if (strokeOrderRef.current) {
      strokeOrderRef.current.eraseLastStrokes(999);
      setCurrentStroke(0);
      setIsPlaying(false);
    }
  };

  const handleStepForward = () => {
    if (strokeOrderRef.current) {
      strokeOrderRef.current.renderNextStrokes(1);
      setCurrentStroke(prev => Math.min(prev + 1, kanji.strokeCount || 0));
      setIsPlaying(false);
    }
  };

  const handleStepBackward = () => {
    if (strokeOrderRef.current) {
      strokeOrderRef.current.eraseLastStrokes(1);
      setCurrentStroke(prev => Math.max(prev - 1, 0));
      setIsPlaying(false);
    }
  };

  const handleSaveStory = async () => {
    const session = getStudentSession();
    if (!session) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      saveStory(session.userId, kanji.id, story);
      setSaveMessage('Saved!');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (error) {
      setSaveMessage('Error saving');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      {/* Kanji Display */}
      <div className="text-center mb-6">
        <div className="text-9xl font-bold text-gray-900 mb-4 leading-none">
          {kanji.kanji}
        </div>
        <div className="text-3xl font-semibold text-blue-600 mb-2">
          {kanji.keyword}
        </div>
        <div className="text-sm text-gray-500 space-x-3">
          <span>Heisig #{kanji.heisig_number}</span>
          <span>•</span>
          <span>Strokes: {kanji.strokeCount || 10}</span>
        </div>
      </div>

      {/* Stroke Order Animation Toggle */}
      <div className="mb-6 text-center">
        <button
          onClick={() => setShowStrokeOrder(!showStrokeOrder)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          {showStrokeOrder ? <EyeOff size={18} /> : <Eye size={18} />}
          <span>{showStrokeOrder ? 'Hide' : 'Show'} Stroke Order</span>
        </button>
      </div>

      {/* Stroke Order Animation */}
      {showStrokeOrder && (
        <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
          <h3 className="text-sm font-semibold text-purple-900 mb-4 text-center">
            Stroke Order Animation
          </h3>
          
          {/* Animation Container */}
          <div className="flex justify-center mb-4">
            <div 
              ref={containerRef}
              className="bg-white rounded-lg border-2 border-purple-300 shadow-inner"
              style={{ width: '200px', height: '200px' }}
            />
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={handleStepBackward}
              className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
              disabled={currentStroke === 0}
              title="Previous stroke"
            >
              <ChevronLeft size={18} />
            </button>
            
            <button
              onClick={handlePlay}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            
            <button
              onClick={handleStepForward}
              className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
              disabled={currentStroke >= (kanji.strokeCount || 0)}
              title="Next stroke"
            >
              <ChevronRight size={18} />
            </button>
            
            <button
              onClick={handleReset}
              className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              title="Reset"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="text-xs text-center text-purple-700 mt-3">
            Stroke {currentStroke} of {kanji.strokeCount || 0}
          </div>
        </div>
      )}

      {/* Primitives */}
      {kanji.primitives && kanji.primitives.length > 0 && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg">
          <h3 className="text-sm font-semibold text-purple-900 mb-2">Primitives</h3>
          <div className="flex flex-wrap gap-2">
            {kanji.primitives.map((primitive, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {primitive}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Story Section */}
      {showStory && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Your Mnemonic Story</h3>
            {editableStory && (
              <div className="flex items-center space-x-2">
                {saveMessage && (
                  <span className="text-sm text-green-600">{saveMessage}</span>
                )}
                <button
                  onClick={handleSaveStory}
                  disabled={isSaving}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            )}
          </div>
          {editableStory ? (
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Write your mnemonic story here... Use the primitives to create a memorable story that helps you remember the kanji's meaning."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-800"            />
          ) : (
            <div className="w-full min-h-[8rem] px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
              {story || <span className="text-gray-400">No story yet</span>}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Stories are saved automatically to your local device
          </p>
        </div>
      )}
    </div>
  );
}
