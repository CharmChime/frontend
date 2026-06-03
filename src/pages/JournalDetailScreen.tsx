import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Badge } from '../components/Badge';
import { ChildSidebar } from '../components/ChildSidebar';
import { MobileMenuButton } from '../components/MobileMenuButton';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { ArrowLeft, Volume2, VolumeX, Star, Share2, Trash2, Edit, Calendar, Heart, Sparkles, Wand2 } from 'lucide-react';

interface JournalDetailScreenProps {
  onBack: () => void;
  childName?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  entryId?: number;
}

export function JournalDetailScreen({ 
  onBack, 
  childName = 'Friend', 
  onNavigate,
  onLogout,
  entryId = 1
}: JournalDetailScreenProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout?.();
  };

  const handleSidebarNavigation = (page: string) => {
    if (page === 'memories') {
      onBack();
    } else if (page === 'home') {
      onNavigate?.('home');
    } else {
      onNavigate?.(page);
    }
  };

  // All memories data
  const allMemories = [
    {
      id: 1,
      title: "My Amazing Day at the Park",
      date: "December 1, 2025",
      time: "4:30 PM",
      mood: "happy",
      moodEmoji: "😊",
      tag: "Friends",
      content: `Today was so much fun! I went to the park with my friends Emma and Lucas. We played on the swings and went really high - I felt like I was flying!

Then we found a cool spot under this big tree and had a picnic. Mom packed my favorite sandwiches and some cookies. We shared everything and talked about our favorite superheroes.

Lucas brought his new kite and we took turns flying it. The kite was shaped like a dragon and it looked so cool against the blue sky! When it was my turn, the wind picked up and the kite went super high. I felt so proud!

After that, we played hide and seek. I found the best hiding spot behind the flower bushes. Emma couldn't find me for almost 10 minutes! When she finally did, we all laughed so hard.

Before going home, we watched the sunset together. The sky turned all orange and pink - it was beautiful. We promised to come back to the park next weekend.

I love days like this with my friends. They make me so happy! 💙`,
      color: "child-yellow",
      wordCount: 178,
      readingTime: "2 min"
    },
    {
      id: 2,
      title: "Learning About Space 🚀",
      date: "November 30, 2025",
      time: "3:15 PM",
      mood: "excited",
      moodEmoji: "🤩",
      tag: "School",
      content: `In science class today, we learned about planets and stars. Did you know Jupiter is the biggest planet in our solar system? It's so big that 1,000 Earths could fit inside it! That's amazing!

Our teacher, Ms. Johnson, showed us pictures from space telescopes. We saw galaxies that are millions of light-years away. I couldn't even imagine how far that is!

We also learned about constellations. My favorite is Orion because it looks like a hunter. I'm going to look for it in the sky tonight with Dad.

For homework, we have to draw our own imaginary planet. I'm going to make mine purple with two moons and rings made of candy! Wouldn't that be cool?

I love learning about space. Maybe one day I'll become an astronaut and explore the stars! 🌟`,
      color: "child-peach",
      wordCount: 142,
      readingTime: "1 min"
    },
    {
      id: 3,
      title: "Rainy Day Thoughts",
      date: "November 29, 2025",
      time: "2:00 PM",
      mood: "calm",
      moodEmoji: "😌",
      tag: "Relaxation",
      content: `It's raining outside and I'm reading my favorite book under a cozy blanket. The rain sounds are so peaceful - like nature's lullaby.

I can hear the raindrops tapping on my window, making a gentle rhythm. It reminds me of a song. Sometimes I close my eyes and just listen.

Mom made hot cocoa with marshmallows. It's warm and sweet, perfect for a rainy day. The steam rises from my cup and makes swirly patterns in the air.

I'm reading "Charlie and the Chocolate Factory" again. Even though I've read it before, it's still magical. I imagine what it would be like to visit Willy Wonka's factory.

Rainy days used to make me sad, but now I love them. They're perfect for slowing down and enjoying the quiet moments. Sometimes the best adventures happen inside your imagination. 🌧️💭`,
      color: "child-mint",
      wordCount: 145,
      readingTime: "2 min"
    },
    {
      id: 4,
      title: "Birthday Party Fun! 🎉",
      date: "November 25, 2025",
      time: "5:45 PM",
      mood: "joyful",
      moodEmoji: "🥳",
      tag: "Celebration",
      content: `Had the best birthday party ever! All my friends came - Emma, Lucas, Sofia, and Jake. Mom decorated the whole house with balloons and streamers in my favorite colors.

We played musical chairs, pin the tail on the donkey, and treasure hunt. I hid the clues all around the house and backyard. Jake found the treasure chest first - it was full of candy!

The cake was amazing! It was chocolate with vanilla frosting and had a unicorn on top. When everyone sang "Happy Birthday," I felt so special and loved.

My favorite present was the art set from Grandma. It has 100 different colors! I can't wait to create new drawings.

We ended the day watching a movie and eating popcorn. Before everyone left, they gave me the biggest group hug. I felt so lucky to have such amazing friends! 🎂🎈`,
      color: "child-peach",
      wordCount: 156,
      readingTime: "2 min"
    },
    {
      id: 5,
      title: "A Story I Wrote",
      date: "November 24, 2025",
      time: "7:00 PM",
      mood: "creative",
      moodEmoji: "✨",
      tag: "Stories",
      content: `Once upon a time, there was a magical dragon named Sparkle who loved to paint rainbows in the sky. Unlike other dragons who breathed fire, Sparkle breathed colors!

Every morning, Sparkle would wake up and fly high above the clouds. With each breath, beautiful colors would stream from her mouth - red, orange, yellow, green, blue, indigo, and violet.

One day, the world became gray and sad. All the colors had disappeared! The flowers, the sky, even the butterflies were all gray. Everyone felt gloomy.

Sparkle knew she had to help. She flew all around the world, breathing her rainbow breath everywhere she went. Slowly, color returned to the world. The flowers bloomed in bright reds and yellows, the sky turned blue again, and the butterflies got their beautiful patterns back.

The people were so happy! They threw a big celebration for Sparkle. From that day on, whenever people saw a rainbow, they remembered Sparkle the dragon and smiled.

The End. 🌈✨

I love writing stories! Maybe I'll write more about Sparkle's adventures.`,
      color: "child-lavender",
      wordCount: 198,
      readingTime: "2 min"
    },
    {
      id: 6,
      title: "Family Game Night",
      date: "November 20, 2025",
      time: "8:30 PM",
      mood: "loved",
      moodEmoji: "🥰",
      tag: "Family",
      content: `We played board games tonight and I won three times! We played Monopoly, Uno, and Pictionary. I was on a winning streak!

In Monopoly, I bought all the railroads and made everyone pay rent. Dad said I was a "real estate tycoon" - I had to ask what that meant, and he explained it's someone who's really good at buying and selling property.

During Pictionary, Mom's drawings were so funny! She tried to draw a giraffe but it looked like a weird snake with legs. We all laughed so hard!

Dad made his famous hot chocolate with whipped cream and chocolate chips. It's the best! He has a secret ingredient but won't tell me what it is. I think it's cinnamon.

After the games, we cuddled on the couch and watched a movie together. I fell asleep halfway through, but I didn't mind. Being with my family makes me feel so safe and loved.

These are my favorite nights. I wish we could do this every week! ❤️🎲`,
      color: "child-yellow",
      wordCount: 189,
      readingTime: "2 min"
    },
    {
      id: 7,
      title: "My Painting Journey",
      date: "November 18, 2025",
      time: "4:00 PM",
      mood: "creative",
      moodEmoji: "🎨",
      tag: "Art",
      content: `Today I started a new painting. I want to create something that shows how I feel inside - happy, colorful, and full of dreams.

I mixed different colors on my palette. Blue and yellow made green, red and white made pink. It's like magic how colors can blend together and create something new!

I decided to paint a garden with flowers of every color. Each flower represents something I love - yellow sunflowers for happiness, red roses for love, purple lavender for calm, and orange marigolds for energy.

In the center, I painted a little girl (that's me!) sitting and reading a book. Around her, butterflies and birds are flying. The sky is filled with soft clouds and a warm sun.

It took me three hours, but I loved every minute. Art makes me feel free and creative. When I paint, I can express feelings that I don't have words for.

Mom hung it on the refrigerator. She said it's beautiful and that I'm a real artist. That made me so proud! 🎨🖌️`,
      color: "child-lavender",
      wordCount: 187,
      readingTime: "2 min"
    },
    {
      id: 8,
      title: "Quiet Morning",
      date: "November 15, 2025",
      time: "6:30 AM",
      mood: "calm",
      moodEmoji: "🌅",
      tag: "Morning",
      content: `Woke up early today before everyone else. The house was so quiet and peaceful. I could hear birds chirping outside my window.

I went downstairs and sat by the window with my favorite stuffed bunny. The sun was just starting to rise, painting the sky in soft pinks and oranges.

I made myself some cereal and ate it slowly, watching the world wake up. A squirrel ran across our backyard, and I saw Mrs. Chen walking her dog down the street.

There's something special about early mornings. Everything feels fresh and new, like the world is giving us another chance to have a good day.

I spent some time writing in my journal and thinking about my dreams. I dreamed I could fly last night! It felt so real.

When Mom woke up, I made her breakfast in bed - toast with jam and orange juice. She was so surprised! She said it was the best way to start her day.

These quiet moments make me feel grateful for everything I have. 🌅☕`,
      color: "child-mint",
      wordCount: 182,
      readingTime: "2 min"
    },
  ];

  // Find the entry that matches the entryId
  const entry = allMemories.find(m => m.id === entryId) || allMemories[0];

  const voices = [
    {
      id: 'cheerful',
      name: 'Cheerful Charlie',
      emoji: '😄',
      description: 'Happy and energetic!',
      color: 'from-yellow-400 to-orange-400',
      icon: '🌟'
    },
    {
      id: 'calm',
      name: 'Calm Casey',
      emoji: '😌',
      description: 'Soothing and gentle',
      color: 'from-blue-400 to-cyan-400',
      icon: '🌊'
    },
    {
      id: 'storyteller',
      name: 'Story Sam',
      emoji: '📚',
      description: 'Dramatic storyteller',
      color: 'from-purple-400 to-pink-400',
      icon: '✨'
    },
    {
      id: 'robot',
      name: 'Robot Rosie',
      emoji: '🤖',
      description: 'Funny robot voice',
      color: 'from-gray-400 to-slate-500',
      icon: '⚡'
    },
    {
      id: 'pirate',
      name: 'Pirate Pete',
      emoji: '🏴‍☠️',
      description: 'Arrr matey!',
      color: 'from-amber-600 to-red-600',
      icon: '⚓'
    },
    {
      id: 'fairy',
      name: 'Fairy Flora',
      emoji: '🧚',
      description: 'Magical and sweet',
      color: 'from-pink-400 to-rose-400',
      icon: '🪄'
    },
  ];

  const handlePlayVoice = (voiceId: string) => {
    setSelectedVoice(voiceId);
    setIsPlaying(true);
    // Simulate playing
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const handleStopVoice = () => {
    setIsPlaying(false);
    setSelectedVoice(null);
  };

  return (
    <div className="min-h-screen bg-[var(--child-bg)] flex">
      {/* Mobile Menu Button */}
      {onNavigate && onLogout && (
        <MobileMenuButton onClick={() => setIsSidebarOpen(true)} />
      )}

      {/* Sidebar */}
      {onNavigate && onLogout && (
        <ChildSidebar 
          childName={childName}
          activeItem="memories"
          onNavigate={handleSidebarNavigation}
          onLogout={() => setShowLogoutConfirm(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogoClick={onBack}
        />
      )}

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-gradient-to-r from-[var(--child-blue)] to-[var(--child-mint)] shadow-lg sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <IconButton variant="child-yellow" size="medium" onClick={onBack}>
                  <ArrowLeft className="w-5 h-5" />
                </IconButton>
                <div className="flex-1 min-w-0">
                  <h1 className="text-[#1a365d] text-xl sm:text-2xl lg:text-3xl truncate">{entry.title}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="child-yellow" className="text-xs sm:text-sm">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {entry.date}
                    </Badge>
                    <Badge variant="child-slate" className="text-xs sm:text-sm">
                      {entry.wordCount} words
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <IconButton 
                  variant={isFavorite ? "child-yellow" : "child-blue"}
                  size="medium"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Star className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
                </IconButton>
                <IconButton variant="child-mint" size="medium">
                  <Share2 className="w-5 h-5" />
                </IconButton>
                <IconButton variant="child-peach" size="medium">
                  <Edit className="w-5 h-5" />
                </IconButton>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-5xl mx-auto">
          {/* Mood & Info */}
          <Card variant="child" className="bg-gradient-to-br from-white to-[var(--child-yellow)]/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--${entry.color})] flex items-center justify-center shadow-lg flex-shrink-0`}>
                <span className="text-3xl sm:text-4xl">{entry.moodEmoji}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[#2d3748] mb-2 text-lg sm:text-xl">Feeling {entry.mood} today!</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="child-blue">{entry.tag}</Badge>
                  <Badge variant="child-slate">{entry.time}</Badge>
                  <Badge variant="child-mint">📖 {entry.readingTime} read</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Fun Voice Selection */}
          <Card variant="child">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Volume2 className="w-6 h-6 text-[var(--child-lavender)]" />
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Choose a Fun Voice! 🎭</h3>
              </div>
              <p className="text-[#64748b] text-sm sm:text-base">
                Pick a voice to read your journal entry aloud. Each one sounds different and fun!
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => handlePlayVoice(voice.id)}
                    disabled={isPlaying}
                    className={`
                      p-3 sm:p-4 rounded-[1.5rem]
                      transition-all duration-200
                      flex flex-col items-center gap-2
                      ${selectedVoice === voice.id && isPlaying
                        ? `bg-gradient-to-br ${voice.color} shadow-lg scale-105 text-white animate-pulse`
                        : selectedVoice === voice.id
                        ? `bg-gradient-to-br ${voice.color} shadow-lg text-white`
                        : 'bg-gray-50 hover:bg-gray-100'
                      }
                      ${isPlaying ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    `}
                  >
                    <span className="text-2xl sm:text-3xl">{voice.emoji}</span>
                    <div className="text-center">
                      <p className={`text-xs sm:text-sm ${selectedVoice === voice.id ? 'text-white font-semibold' : 'text-[#2d3748]'}`}>
                        {voice.name}
                      </p>
                      <p className={`text-xs ${selectedVoice === voice.id ? 'text-white/90' : 'text-[#64748b]'}`}>
                        {voice.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Play Controls */}
              {selectedVoice && (
                <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-[var(--child-lavender)]/20 to-[var(--child-peach)]/20 rounded-[1.5rem]">
                  {isPlaying ? (
                    <>
                      <div className="flex items-center gap-2 text-[#2d3748]">
                        <div className="flex gap-1">
                          <div className="w-1 h-4 bg-[var(--child-lavender)] rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1 h-4 bg-[var(--child-lavender)] rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1 h-4 bg-[var(--child-lavender)] rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm sm:text-base">
                          Playing with {voices.find(v => v.id === selectedVoice)?.name}...
                        </span>
                      </div>
                      <Button 
                        variant="child-peach" 
                        size="small" 
                        icon={<VolumeX className="w-4 h-4" />}
                        onClick={handleStopVoice}
                      >
                        Stop
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm sm:text-base text-[#2d3748]">
                        Ready with {voices.find(v => v.id === selectedVoice)?.name}!
                      </span>
                      <Button 
                        variant="child-lavender" 
                        size="small" 
                        icon={<Volume2 className="w-4 h-4" />}
                        onClick={() => handlePlayVoice(selectedVoice)}
                      >
                        Play Again
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Journal Content */}
          <Card variant="child">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--child-blue)]" fill="currentColor" />
                <h3 className="text-[#2d3748] text-lg sm:text-xl">Your Story</h3>
              </div>
              <div className="prose prose-lg max-w-none">
                <div className="text-[#2d3748] leading-relaxed whitespace-pre-line text-sm sm:text-base lg:text-lg">
                  {entry.content}
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card variant="child" className="bg-gradient-to-br from-white to-[var(--child-mint)]/10">
            <div className="space-y-4">
              <h4 className="text-[#2d3748] text-base sm:text-lg">What would you like to do?</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  variant="child-lavender" 
                  size="medium"
                  icon={<Wand2 className="w-5 h-5" />}
                  className="w-full"
                >
                  Turn into a Story
                </Button>
                <Button 
                  variant="child-blue" 
                  size="medium"
                  icon={<Share2 className="w-5 h-5" />}
                  className="w-full"
                >
                  Share with Family
                </Button>
                <Button 
                  variant="child-peach" 
                  size="medium"
                  icon={<Edit className="w-5 h-5" />}
                  className="w-full"
                >
                  Edit Entry
                </Button>
                <Button 
                  variant="child-slate" 
                  size="medium"
                  icon={<Trash2 className="w-5 h-5" />}
                  className="w-full"
                >
                  Delete Entry
                </Button>
              </div>
            </div>
          </Card>

          {/* Memory Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card variant="child" padding="small">
              <div className="text-center">
                <span className="text-2xl mb-1 block">👀</span>
                <p className="text-lg sm:text-xl text-[#2d3748]">12</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Times Read</p>
              </div>
            </Card>
            <Card variant="child" padding="small">
              <div className="text-center">
                <span className="text-2xl mb-1 block">💭</span>
                <p className="text-lg sm:text-xl text-[#2d3748]">{entry.wordCount}</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Words</p>
              </div>
            </Card>
            <Card variant="child" padding="small">
              <div className="text-center">
                <span className="text-2xl mb-1 block">⏱️</span>
                <p className="text-lg sm:text-xl text-[#2d3748]">12m</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Time Spent</p>
              </div>
            </Card>
            <Card variant="child" padding="small">
              <div className="text-center">
                <span className="text-2xl mb-1 block">❤️</span>
                <p className="text-lg sm:text-xl text-[#2d3748] capitalize">{entry.mood}</p>
                <p className="text-xs sm:text-sm text-[#64748b]">Mood</p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Logout Confirmation */}
      {onLogout && (
        <LogoutConfirmation 
          isOpen={showLogoutConfirm}
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
          variant="child"
        />
      )}
    </div>
  );
}