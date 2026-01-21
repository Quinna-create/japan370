'use client';

/**
 * Reusable Kanji Card component with story editing, stroke count, and stroke order animation
 */

import { useState, useEffect, useRef } from 'react';
import { Save, Loader2, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Kanji } from '@/types/kanji';
import { getStudentSession } from '@/lib/storage';
import { getStory, saveStory } from '@/lib/storage';

// Animation constants
const STROKE_ANIMATION_DURATION = 500; // milliseconds
const STROKE_ANIMATION_DELAY = 200; // milliseconds between strokes

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
  const strokePathsRef = useRef<SVGPathElement[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = getStudentSession();
    if (session) {
      const userStory = getStory(session.userId, kanji.id);
      setStory(userStory);
    }
  }, [kanji.id]);

  // Load KanjiVG SVG and initialize stroke order animation
  useEffect(() => {
    if (showStrokeOrder && containerRef.current) {
      loadStrokeOrderAnimation();
    }
    
    return () => {
      // Cleanup animation frame on unmount
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showStrokeOrder, kanji.kanji]);

  const loadStrokeOrderAnimation = async () => {
    try {
      // Get Unicode code point for the kanji
      const unicode = kanji.kanji.codePointAt(0)?.toString(16).padStart(5, '0');
      if (!unicode) {
        throw new Error('Invalid kanji character');
      }
      
      // Fetch SVG from KanjiVG CDN
      const svgUrl = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${unicode}.svg`;
      const response = await fetch(svgUrl);
      
      if (!response.ok) {
        throw new Error('KanjiVG data not found');
      }
      
      const svgText = await response.text();
      displayStrokeOrder(svgText);
    } catch (error) {
      console.error('Error loading stroke order:', error);
      if (containerRef.current) {
        // Clear container and create error message elements
        containerRef.current.innerHTML = '';
        const errorWrapper = document.createElement('div');
        errorWrapper.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%; color: #666; text-align: center; padding: 20px; font-size: 14px;';
        
        const errorContent = document.createElement('div');
        const errorTitle = document.createElement('div');
        errorTitle.textContent = 'Stroke order data not available';
        
        const errorSubtitle = document.createElement('div');
        errorSubtitle.style.cssText = 'font-size: 12px; margin-top: 8px; color: #999;';
        errorSubtitle.textContent = 'for this kanji';
        
        errorContent.appendChild(errorTitle);
        errorContent.appendChild(errorSubtitle);
        errorWrapper.appendChild(errorContent);
        containerRef.current.appendChild(errorWrapper);
      }
    }
  };

  const displayStrokeOrder = (svgText: string) => {
    if (!containerRef.current) return;
    
    // Parse SVG
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
    const svg = svgDoc.querySelector('svg');
    
    if (!svg) {
      throw new Error('Invalid SVG data');
    }
    
    // Configure SVG display
    svg.setAttribute('width', '200');
    svg.setAttribute('height', '200');
    svg.setAttribute('viewBox', '0 0 109 109');
    svg.style.display = 'block';
    
    // Clear container and add SVG
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(svg);
    
    // Setup stroke animation
    setupStrokeAnimation(svg);
  };

  const setupStrokeAnimation = (svg: SVGSVGElement) => {
    // Get all path elements that represent strokes (they have IDs)
    const paths = Array.from(svg.querySelectorAll('path[id]'));
    strokePathsRef.current = paths as SVGPathElement[];
    
    // Initialize all strokes as hidden
    paths.forEach((path: Element) => {
      const pathElement = path as SVGPathElement;
      const length = pathElement.getTotalLength();
      
      // Set up stroke dash animation
      pathElement.style.strokeDasharray = `${length}`;
      pathElement.style.strokeDashoffset = `${length}`;
      pathElement.style.fill = 'none';
      pathElement.style.stroke = '#000';
      pathElement.style.strokeWidth = '3';
      pathElement.style.strokeLinecap = 'round';
      pathElement.style.strokeLinejoin = 'round';
    });
    
    setCurrentStroke(0);
  };

  const animateStrokePath = (
    path: SVGPathElement,
    fromOffset: number,
    toOffset: number,
    duration: number,
    onComplete: () => void
  ) => {
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-in-out function
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      const currentOffset = fromOffset + (toOffset - fromOffset) * easeProgress;
      path.style.strokeDashoffset = `${currentOffset}`;
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const animateNextStroke = (strokeIndex?: number) => {
    const index = strokeIndex ?? currentStroke;
    
    if (index >= strokePathsRef.current.length) {
      setIsPlaying(false);
      return;
    }
    
    const path = strokePathsRef.current[index];
    const length = path.getTotalLength();
    
    // Animate stroke from hidden to visible
    animateStrokePath(path, length, 0, STROKE_ANIMATION_DURATION, () => {
      const nextStroke = index + 1;
      setCurrentStroke(nextStroke);
      
      // Continue to next stroke if still playing
      if (nextStroke < strokePathsRef.current.length) {
        setTimeout(() => {
          animateNextStroke(nextStroke);
        }, STROKE_ANIMATION_DELAY);
      } else {
        setIsPlaying(false);
      }
    });
  };

  const handlePlay = () => {
    if (!strokePathsRef.current.length) return;
    
    if (isPlaying) {
      // Pause animation
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else {
      // Start or resume animation
      setIsPlaying(true);
      animateNextStroke();
    }
  };

  const handleReset = () => {
    if (!strokePathsRef.current.length) return;
    
    // Stop any ongoing animation
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Reset all strokes to hidden
    strokePathsRef.current.forEach((path: SVGPathElement) => {
      const length = path.getTotalLength();
      path.style.strokeDashoffset = `${length}`;
    });
    
    setCurrentStroke(0);
  };

  const handleStepForward = () => {
    if (!strokePathsRef.current.length || currentStroke >= strokePathsRef.current.length) return;
    
    // Stop any ongoing animation
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Show the next stroke instantly
    const path = strokePathsRef.current[currentStroke];
    path.style.strokeDashoffset = '0';
    
    setCurrentStroke(prev => prev + 1);
  };

  const handleStepBackward = () => {
    if (!strokePathsRef.current.length || currentStroke <= 0) return;
    
    // Stop any ongoing animation
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Hide the previous stroke (access array before state update)
    const prevStrokeIndex = currentStroke - 1;
    const path = strokePathsRef.current[prevStrokeIndex];
    const length = path.getTotalLength();
    path.style.strokeDashoffset = `${length}`;
    
    setCurrentStroke(prevStrokeIndex);
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
              disabled={currentStroke >= strokePathsRef.current.length}
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
            Stroke {currentStroke} of {strokePathsRef.current.length || kanji.strokeCount || 0}
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
