// lib/youtubeService.ts
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

export interface YouTubeResource {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  channel: string;
  duration?: string;
  viewCount?: string;
  publishedAt?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  category?: string;
  language?: string;
}

// Enhanced search with multiple strategies
export const searchEducationalVideos = async (query: string): Promise<YouTubeResource[]> => {
  try {
    console.log('🔍 Enhanced search for:', query);
    
    if (!YOUTUBE_API_KEY) {
      console.error('❌ YouTube API key not found');
      return getEnhancedFallbackResources(query);
    }

    const searchStrategies = [
      // Strategy 1: Direct tutorials
      `${query} tutorial full course`,
      // Strategy 2: University/educational content
      `${query} lectures university`,
      // Strategy 3: Crash courses
      `${query} crash course`,
      // Strategy 4: Beginner guides
      `${query} for beginners`,
      // Strategy 5: Advanced topics
      `${query} advanced concepts`,
      // Strategy 6: Practical examples
      `${query} examples projects`,
      // Strategy 7: Problem solving
      `${query} problems solutions`,
      // Strategy 8: Exam preparation
      `${query} exam preparation`,
    ];

    let allResults: YouTubeResource[] = [];
    const seenVideoIds = new Set();

    // Search with multiple strategies
    for (const searchQuery of searchStrategies) {
      if (allResults.length >= 20) break; // Stop if we have enough results
      
      try {
        const searchUrl = `${YOUTUBE_API_URL}?part=snippet&type=video&videoEmbeddable=true&maxResults=10&q=${encodeURIComponent(searchQuery)}&key=${YOUTUBE_API_KEY}`;
        
        console.log('📡 Searching:', searchQuery);
        const response = await fetch(searchUrl);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.items && data.items.length > 0) {
            const newResults = data.items
              .filter((item: any) => !seenVideoIds.has(item.id.videoId))
              .map((item: any) => {
                seenVideoIds.add(item.id.videoId);
                return {
                  id: item.id.videoId,
                  title: item.snippet.title,
                  description: this.cleanDescription(item.snippet.description),
                  thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
                  url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                  channel: item.snippet.channelTitle,
                  publishedAt: item.snippet.publishedAt,
                  difficulty: this.estimateDifficulty(item.snippet.title, item.snippet.description),
                  category: this.detectCategory(item.snippet.title, query),
                  language: 'English' // Can be enhanced
                };
              });

            allResults.push(...newResults);
            console.log('✅ Added', newResults.length, 'videos from:', searchQuery);
          }
        }
      } catch (error) {
        console.log('⚠️ Search failed for:', searchQuery);
        // Continue with next strategy
      }
    }

    // Remove duplicates and limit results
    const uniqueResults = this.removeDuplicates(allResults);
    console.log('🎯 Final unique results:', uniqueResults.length);

    return uniqueResults.slice(0, 15); // Return max 15 best results
    
  } catch (error) {
    console.error('🚨 YouTube API error:', error);
    return getEnhancedFallbackResources(query);
  }
};

// Helper methods
const cleanDescription = (description: string): string => {
  if (!description) return 'Educational content for learning this topic';
  
  // Remove excessive newlines and trim
  return description
    .replace(/\n\s*\n/g, '\n') // Remove multiple newlines
    .substring(0, 200) // Limit length
    .trim() + (description.length > 200 ? '...' : '');
};

const estimateDifficulty = (title: string, description: string): string => {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('beginner') || text.includes('basic') || text.includes('introduction')) {
    return 'Beginner';
  } else if (text.includes('advanced') || text.includes('expert') || text.includes('master')) {
    return 'Advanced';
  } else if (text.includes('intermediate') || text.includes('complete guide')) {
    return 'Intermediate';
  }
  
  return 'Beginner'; // Default
};

const detectCategory = (title: string, query: string): string => {
  const lowerTitle = title.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  if (lowerTitle.includes('crash course') || lowerTitle.includes('full course')) {
    return 'Comprehensive Course';
  } else if (lowerTitle.includes('tutorial') || lowerTitle.includes('guide')) {
    return 'Tutorial';
  } else if (lowerTitle.includes('lecture') || lowerTitle.includes('university')) {
    return 'Academic Lecture';
  } else if (lowerTitle.includes('project') || lowerTitle.includes('build')) {
    return 'Project-based';
  }
  
  return 'Educational Content';
};

const removeDuplicates = (results: YouTubeResource[]): YouTubeResource[] => {
  const seen = new Set();
  return results.filter(result => {
    const duplicate = seen.has(result.id);
    seen.add(result.id);
    return !duplicate;
  });
};

// Enhanced fallback with MUCH more content
const getEnhancedFallbackResources = (query: string): YouTubeResource[] => {
  const enhancedFallbacks: { [key: string]: YouTubeResource[] } = {
    calculus: [
      {
        id: 'HfACrKJ_Y2w',
        title: 'Calculus 1 - Full College Course',
        description: 'Complete Calculus 1 course covering limits, derivatives, and integrals. Perfect for college students and beginners.',
        thumbnail: 'https://i.ytimg.com/vi/HfACrKJ_Y2w/mqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=HfACrKJ_Y2w',
        channel: 'freeCodeCamp.org',
        difficulty: 'Beginner',
        category: 'Comprehensive Course'
      },
      {
        id: '7K1sB05pE0A',
        title: 'Calculus for Beginners - The Ultimate Guide',
        description: 'Perfect introduction to calculus concepts with clear explanations and examples.',
        thumbnail: 'https://i.ytimg.com/vi/7K1sB05pE0A/mqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=7K1sB05pE0A',
        channel: 'Professor Dave Explains',
        difficulty: 'Beginner',
        category: 'Tutorial'
      },
      {
        id: 'XPxyTsur1Lw',
        title: 'Limits and Continuity - Complete Guide',
        description: 'Deep dive into limits, continuity, and their applications in calculus.',
        thumbnail: 'https://i.ytimg.com/vi/XPxyTsur1Lw/mqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=XPxyTsur1Lw',
        channel: 'The Organic Chemistry Tutor',
        difficulty: 'Intermediate',
        category: 'Academic Lecture'
      },
      {
        id: 'rC_4ZQP1_D8',
        title: 'Derivatives - Calculus Made Easy',
        description: 'Learn derivatives with practical examples and real-world applications.',
        thumbnail: 'https://i.ytimg.com/vi/rC_4ZQP1_D8/mqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=rC_4ZQP1_D8',
        channel: 'NancyPi',
        difficulty: 'Beginner',
        category: 'Tutorial'
      },
      {
        id: 'ouZ9sBZ6sY8',
        title: 'Integral Calculus - Full University Course',
        description: 'Complete integral calculus course with problem-solving techniques.',
        thumbnail: 'https://i.ytimg.com/vi/ouZ9sBZ6sY8/mqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=ouZ9sBZ6sY8',
        channel: 'MIT OpenCourseWare',
        difficulty: 'Intermediate',
        category: 'Academic Lecture'
      }
    ],
    programming: [
      {
        id: '_uQrJ0TkZlc',
        title: 'Python for Beginners - Full Course [2024]',
        description: 'Learn Python programming from scratch. Perfect for absolute beginners with hands-on projects.',
        thumbnail: 'https://i.ytimg.com/vi/_uQrJ0TkZlc/mqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
        channel: 'Programming with Mosh',
        difficulty: 'Beginner',
        category: 'Comprehensive Course'
      },
      {
        id: 'rfscVS0vtbw',
        title: 'Learn Python - Full Course for Beginners',
        description: '4-hour Python crash course covering all fundamental concepts with practical exercises.',
        thumbnail: 'https://i.ytimg.com/vi/rfscVS0vtbw/mqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
        channel: 'freeCodeCamp.org',
        difficulty: 'Beginner',
        category: 'Crash Course'
      },
      {
        id: '8mAITcNt710',
        title: 'JavaScript Programming - Complete Guide',
        description: 'Master JavaScript from basics to advanced concepts with real projects.',
        thumbnail: 'https://i.ytimg.com/vi/8mAITcNt710/mqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=8mAITcNt710',
        channel: 'Programming with Mosh',
        difficulty: 'Beginner',
        category: 'Comprehensive Course'
      },
      {
        id: 'W6NZfCO5SIk',
        title: 'JavaScript Beginners Tutorial',
        description: 'Quick start guide to JavaScript fundamentals and DOM manipulation.',
        thumbnail: 'https://i.ytimg.com/vi/W6NZfCO5SIk/mqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
        channel: 'Programming with Mosh',
        difficulty: 'Beginner',
        category: 'Tutorial'
      },
      {
        id: 'viQ5nYVqRcM',
        title: 'Web Development Full Course',
        description: 'Complete web development course covering HTML, CSS, JavaScript, and frameworks.',
        thumbnail: 'https://i.ytimg.com/vi/viQ5nYVqRcM/mqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=viQ5nYVqRcM',
        channel: 'freeCodeCamp.org',
        difficulty: 'Beginner',
        category: 'Comprehensive Course'
      }
    ],
    // Add more subjects with rich content...
  };

  const lowerQuery = query.toLowerCase();
  for (const [subject, resources] of Object.entries(enhancedFallbacks)) {
    if (lowerQuery.includes(subject)) {
      console.log('🎯 Using enhanced fallback for:', subject);
      return resources;
    }
  }

  // Generic fallback for any query
  return [
    {
      id: 'generic1',
      title: `Learn ${query} - Complete Guide`,
      description: `Comprehensive educational content about ${query}. Perfect for students and learners.`,
      thumbnail: 'https://i.ytimg.com/vi/HfACrKJ_Y2w/mqdefault.jpg',
      url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query + ' tutorial'),
      channel: 'Various Educators',
      difficulty: 'Beginner',
      category: 'Educational Content'
    },
    {
      id: 'generic2',
      title: `${query} Crash Course`,
      description: `Quick introduction to ${query} concepts and fundamentals.`,
      thumbnail: 'https://i.ytimg.com/vi/_uQrJ0TkZlc/mqdefault.jpg',
      url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query + ' crash course'),
      channel: 'Educational Channels',
      difficulty: 'Beginner',
      category: 'Crash Course'
    }
  ];
};