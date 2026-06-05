import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { ChildSidebar } from '../components/ChildSidebar';
import { MobileMenuButton } from '../components/MobileMenuButton';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { MemoryDetailScreen, type Memory } from './MemoryDetailScreen';
import { ArrowLeft, Search, Filter, Calendar, Star, Heart, BookOpen, Sparkles, ChevronDown, Volume2, Smile, Edit, Trash2 } from 'lucide-react';

interface MemoriesScreenProps {
  onBack: () => void;
  childName?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  onViewEntry?: (entryId: number) => void;
}

export function MemoriesScreen({ onBack, childName = 'Friend', onNavigate, onLogout, onViewEntry }: MemoriesScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout?.();
  };

  const handleSidebarNavigation = (page: string) => {
    if (page === 'memories') return; // Already here
    if (page === 'home') {
      onBack();
    } else {
      onNavigate?.(page);
    }
  };

  const allMemories: Memory[] = [
    {
      id: 1,
      title: "My Amazing Day at the Park",
      preview: "Today was so much fun! I went to the park with my friends and we played on the swings...",
      content: `Today was so much fun! I went to the park with my friends Emma and Lucas. We played on the swings and went really high - I felt like I was flying!

Then we found a cool spot under this big tree and had a picnic. Mom packed my favorite sandwiches and some cookies. We shared everything and talked about our favorite superheroes.

Lucas brought his new kite and we took turns flying it. The kite was shaped like a dragon and it looked so cool against the blue sky! When it was my turn, the wind picked up and the kite went super high. I felt so proud!

After that, we played hide and seek. I found the best hiding spot behind the flower bushes. Emma couldn't find me for almost 10 minutes! When she finally did, we all laughed so hard.

Before going home, we watched the sunset together. The sky turned all orange and pink - it was beautiful. We promised to come back to the park next weekend.

I love days like this with my friends. They make me so happy! 💙`,
      mood: "happy",
      moodEmoji: "😊",
      date: "December 1, 2025",
      time: "4:30 PM",
      tag: "Friends",
      color: "child-yellow",
      wordCount: 178,
      readingTime: "2 min"
    },
    {
      id: 2,
      title: "Learning About Space 🚀",
      preview: "In science class today, we learned about planets and stars. Did you know Jupiter is huge?...",
      content: `In science class today, we learned about planets and stars. Did you know Jupiter is the biggest planet in our solar system? It's so big that 1,000 Earths could fit inside it! That's amazing!

Our teacher, Ms. Johnson, showed us pictures from space telescopes. We saw galaxies that are millions of light-years away. I couldn't even imagine how far that is!

We also learned about constellations. My favorite is Orion because it looks like a hunter. I'm going to look for it in the sky tonight with Dad.

For homework, we have to draw our own imaginary planet. I'm going to make mine purple with two moons and rings made of candy! Wouldn't that be cool?

I love learning about space. Maybe one day I'll become an astronaut and explore the stars! 🌟`,
      mood: "happy",
      moodEmoji: "🤩",
      date: "November 30, 2025",
      time: "3:15 PM",
      tag: "School",
      color: "child-peach",
      wordCount: 142,
      readingTime: "1 min"
    },
    {
      id: 3,
      title: "Rainy Day Thoughts",
      preview: "It's raining outside and I'm reading my favorite book. The rain sounds are so peaceful...",
      content: `It's raining outside and I'm reading my favorite book under a cozy blanket. The rain sounds are so peaceful - like nature's lullaby.

I can hear the raindrops tapping on my window, making a gentle rhythm. It reminds me of a song. Sometimes I close my eyes and just listen.

Mom made hot cocoa with marshmallows. It's warm and sweet, perfect for a rainy day. The steam rises from my cup and makes swirly patterns in the air.

I'm reading "Charlie and the Chocolate Factory" again. Even though I've read it before, it's still magical. I imagine what it would be like to visit Willy Wonka's factory.

Rainy days used to make me sad, but now I love them. They're perfect for slowing down and enjoying the quiet moments. Sometimes the best adventures happen inside your imagination. 🌧️💭`,
      mood: "calm",
      moodEmoji: "😌",
      date: "November 29, 2025",
      time: "2:00 PM",
      tag: "Relaxation",
      color: "child-mint",
      wordCount: 145,
      readingTime: "2 min"
    },
    {
      id: 4,
      title: "Birthday Party Fun! 🎉",
      preview: "Had the best birthday party ever! All my friends came and we had cake and played games...",
      content: `Had the best birthday party ever! All my friends came - Emma, Lucas, Sofia, and Jake. Mom decorated the whole house with balloons and streamers in my favorite colors.

We played musical chairs, pin the tail on the donkey, and treasure hunt. I hid the clues all around the house and backyard. Jake found the treasure chest first - it was full of candy!

The cake was amazing! It was chocolate with vanilla frosting and had a unicorn on top. When everyone sang "Happy Birthday," I felt so special and loved.

My favorite present was the art set from Grandma. It has 100 different colors! I can't wait to create new drawings.

We ended the day watching a movie and eating popcorn. Before everyone left, they gave me the biggest group hug. I felt so lucky to have such amazing friends! 🎂🎈`,
      mood: "happy",
      moodEmoji: "🥳",
      date: "November 25, 2025",
      time: "5:45 PM",
      tag: "Celebration",
      color: "child-peach",
      wordCount: 156,
      readingTime: "2 min"
    },
    {
      id: 5,
      title: "A Story I Wrote",
      preview: "Once upon a time, there was a magical dragon who loved to paint rainbows in the sky...",
      content: `Once upon a time, there was a magical dragon named Sparkle who loved to paint rainbows in the sky. Unlike other dragons who breathed fire, Sparkle breathed colors!

Every morning, Sparkle would wake up and fly high above the clouds. With each breath, beautiful colors would stream from her mouth - red, orange, yellow, green, blue, indigo, and violet.

One day, the world became gray and sad. All the colors had disappeared! The flowers, the sky, even the butterflies were all gray. Everyone felt gloomy.

Sparkle knew she had to help. She flew all around the world, breathing her rainbow breath everywhere she went. Slowly, color returned to the world. The flowers bloomed in bright reds and yellows, the sky turned blue again, and the butterflies got their beautiful patterns back.

The people were so happy! They threw a big celebration for Sparkle. From that day on, whenever people saw a rainbow, they remembered Sparkle the dragon and smiled.

The End. 🌈✨

I love writing stories! Maybe I'll write more about Sparkle's adventures.`,
      mood: "creative",
      moodEmoji: "✨",
      date: "November 24, 2025",
      time: "7:00 PM",
      tag: "Stories",
      color: "child-lavender",
      wordCount: 198,
      readingTime: "2 min"
    },
    {
      id: 6,
      title: "Family Game Night",
      preview: "We played board games tonight and I won! Dad made his famous hot chocolate...",
      content: `We played board games tonight and I won three times! We played Monopoly, Uno, and Pictionary. I was on a winning streak!

In Monopoly, I bought all the railroads and made everyone pay rent. Dad said I was a "real estate tycoon" - I had to ask what that meant, and he explained it's someone who's really good at buying and selling property.

During Pictionary, Mom's drawings were so funny! She tried to draw a giraffe but it looked like a weird snake with legs. We all laughed so hard!

Dad made his famous hot chocolate with whipped cream and chocolate chips. It's the best! He has a secret ingredient but won't tell me what it is. I think it's cinnamon.

After the games, we cuddled on the couch and watched a movie together. I fell asleep halfway through, but I didn't mind. Being with my family makes me feel so safe and loved.

These are my favorite nights. I wish we could do this every week! ❤️🎲`,
      mood: "happy",
      moodEmoji: "🥰",
      date: "November 20, 2025",
      time: "8:30 PM",
      tag: "Family",
      color: "child-yellow",
      wordCount: 189,
      readingTime: "2 min"
    },
    {
      id: 7,
      title: "My Painting Journey",
      preview: "Today I started a new painting. I want to create something that shows how I feel inside...",
      content: `Today I started a new painting. I want to create something that shows how I feel inside - happy, colorful, and full of dreams.

I mixed different colors on my palette. Blue and yellow made green, red and white made pink. It's like magic how colors can blend together and create something new!

I decided to paint a garden with flowers of every color. Each flower represents something I love - yellow sunflowers for happiness, red roses for love, purple lavender for calm, and orange marigolds for energy.

In the center, I painted a little girl (that's me!) sitting and reading a book. Around her, butterflies and birds are flying. The sky is filled with soft clouds and a warm sun.

It took me three hours, but I loved every minute. Art makes me feel free and creative. When I paint, I can express feelings that I don't have words for.

Mom hung it on the refrigerator. She said it's beautiful and that I'm a real artist. That made me so proud! 🎨🖌️`,
      mood: "creative",
      moodEmoji: "🎨",
      date: "November 18, 2025",
      time: "4:00 PM",
      tag: "Art",
      color: "child-lavender",
      wordCount: 187,
      readingTime: "2 min"
    },
    {
      id: 8,
      title: "Quiet Morning",
      preview: "Woke up early today before everyone else. The house was so quiet and peaceful...",
      content: `Woke up early today before everyone else. The house was so quiet and peaceful. I could hear birds chirping outside my window.

I went downstairs and sat by the window with my favorite stuffed bunny. The sun was just starting to rise, painting the sky in soft pinks and oranges.

I made myself some cereal and ate it slowly, watching the world wake up. A squirrel ran across our backyard, and I saw Mrs. Chen walking her dog down the street.

There's something special about early mornings. Everything feels fresh and new, like the world is giving us another chance to have a good day.

I spent some time writing in my journal and thinking about my dreams. I dreamed I could fly last night! It felt so real.

When Mom woke up, I made her breakfast in bed - toast with jam and orange juice. She was so surprised! She said it was the best way to start her day.

These quiet moments make me feel grateful for everything I have. 🌅☕`,
      mood: "calm",
      moodEmoji: "🌅",
      date: "November 15, 2025",
      time: "6:30 AM",
      tag: "Morning",
      color: "child-mint",
      wordCount: 182,
      readingTime: "2 min"
    },
  ];

  // Filter memories based on selected filter and search query
  const getFilteredMemories = () => {
    let filtered = allMemories;

    // Apply mood filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(memory => memory.mood === selectedFilter);
    }

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(memory => 
        memory.title.toLowerCase().includes(query) ||
        memory.preview.toLowerCase().includes(query) ||
        memory.tag.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredMemories = getFilteredMemories();

  // Calculate filter counts
  const getFilterCount = (filterId: string) => {
    if (filterId === 'all') return allMemories.length;
    return allMemories.filter(m => m.mood === filterId).length;
  };

  const filters = [
    { id: 'all', label: 'All Memories', count: getFilterCount('all') },
    { id: 'happy', label: 'Happy', count: getFilterCount('happy') },
    { id: 'creative', label: 'Creative', count: getFilterCount('creative') },
    { id: 'calm', label: 'Calm', count: getFilterCount('calm') },
  ];

  const handleMemoryClick = (memoryId: number) => {
    const memory = allMemories.find(m => m.id === memoryId);
    if (memory) {
      setSelectedMemory(memory);
    }
  };

  const handleBackToList = () => {
    setSelectedMemory(null);
  };

  const handleEditMemory = (memory: Memory) => {
    console.log('Edit memory:', memory);
    // In a real app, this would navigate to an edit screen
  };

  const handleDeleteMemory = (memoryId: number) => {
    console.log('Delete memory:', memoryId);
    // In a real app, this would delete from the database
  };

  // If a memory is selected, show the detail view
  if (selectedMemory) {
    return (
      <MemoryDetailScreen
        memory={selectedMemory}
        onBack={handleBackToList}
        onEdit={handleEditMemory}
        onDelete={handleDeleteMemory}
        childName={childName}
      />
    );
  }

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
          <div className="pl-20 pr-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!onNavigate && (
                    <IconButton variant="child-yellow" size="medium" onClick={onBack}>
                      <ArrowLeft className="w-5 h-5" />
                    </IconButton>
                  )}
                  <h1 className="text-[#1a365d] text-xl sm:text-2xl lg:text-3xl">My Memory Book 📖</h1>
                </div>
                <IconButton variant="child-yellow" size="medium">
                  <Filter className="w-5 h-5" />
                </IconButton>
              </div>

              {/* Search Bar */}
              <div className="bg-white rounded-full shadow-lg">
                <Input
                  placeholder="Search your memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="child"
                  icon={<Search className="w-5 h-5" />}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card variant="child" padding="small">
              <div className="text-center space-y-2">
                <div className="text-2xl sm:text-3xl">📝</div>
                <div className="text-xl sm:text-2xl text-[#2d3748]">{allMemories.length}</div>
                <p className="text-xs sm:text-sm text-[#64748b]">Total Entries</p>
              </div>
            </Card>

            <Card variant="child" padding="small">
              <div className="text-center space-y-2">
                <div className="text-2xl sm:text-3xl">🔥</div>
                <div className="text-xl sm:text-2xl text-[#2d3748]">7</div>
                <p className="text-xs sm:text-sm text-[#64748b]">Day Streak</p>
              </div>
            </Card>

            <Card variant="child" padding="small">
              <div className="text-center space-y-2">
                <div className="text-2xl sm:text-3xl">😊</div>
                <div className="text-xl sm:text-2xl text-[#2d3748]">Most</div>
                <p className="text-xs sm:text-sm text-[#64748b]">Happy Days</p>
              </div>
            </Card>

            <Card variant="child" padding="small">
              <div className="text-center space-y-2">
                <div className="text-2xl sm:text-3xl">✨</div>
                <div className="text-xl sm:text-2xl text-[#2d3748]">{getFilterCount('creative')}</div>
                <p className="text-xs sm:text-sm text-[#64748b]">Stories</p>
              </div>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`
                  px-4 sm:px-5 py-2 rounded-full text-sm sm:text-base
                  transition-all duration-200
                  ${selectedFilter === filter.id
                    ? 'bg-[var(--child-blue)] text-[#1a365d] shadow-lg scale-105'
                    : 'bg-white text-[#4a5568] hover:bg-gray-50 hover:scale-105'
                  }
                `}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          {/* Memory Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {filteredMemories.map(memory => (
              <Card 
                key={memory.id} 
                variant="child" 
                className="cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
                onClick={() => handleMemoryClick(memory.id)}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[#2d3748] mb-1 text-base sm:text-lg truncate">{memory.title}</h4>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-[#64748b]">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{memory.date}</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--${memory.color})] flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <span className="text-xl sm:text-2xl">{memory.moodEmoji}</span>
                    </div>
                  </div>

                  {/* Preview */}
                  <p className="text-[#4a5568] line-clamp-2 text-sm sm:text-base">
                    {memory.preview}
                  </p>

                  {/* Tags & Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <Badge variant={memory.color as any}>
                      {memory.tag}
                    </Badge>
                    <div className="flex gap-1">
                      <IconButton 
                        variant="child-blue" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle voice read
                        }}
                      >
                        <Volume2 className="w-4 h-4" />
                      </IconButton>
                      <IconButton 
                        variant="child-yellow" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle favorite
                        }}
                      >
                        <Star className="w-4 h-4" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State (if no results) */}
          {filteredMemories.length === 0 && (
            <Card variant="child" className="text-center py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-[var(--child-blue)]/20 flex items-center justify-center">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--child-blue)]" />
              </div>
              <h3 className="text-[#2d3748] mb-2 text-lg sm:text-xl">No memories found</h3>
              <p className="text-[#64748b] text-sm sm:text-base">
                {searchQuery 
                  ? 'Try searching with different words' 
                  : `No ${selectedFilter} memories yet. Start writing!`
                }
              </p>
            </Card>
          )}

          {/* Inspirational Message */}
          <Card variant="child" className="bg-gradient-to-br from-white to-[var(--child-lavender)]/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--child-yellow)] to-[var(--child-peach)] flex items-center justify-center shadow-lg flex-shrink-0">
                <Sparkles className="w-7 h-7 text-[#744210]" fill="currentColor" />
              </div>
              <div className="flex-1">
                <p className="text-[#4a5568] text-sm sm:text-base">
                  You've been doing great! {allMemories.length} memories saved. Every entry is a precious moment captured forever. Keep writing! ✨
                </p>
              </div>
            </div>
          </Card>
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
