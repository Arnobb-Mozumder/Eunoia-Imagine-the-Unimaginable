// ==========================================
// DATA: Games
// Add your games here!
// ==========================================

export const games = [
  {
    id: 'sample-web-game',
    title: 'Sample Web Game',
    type: 'web',        // 'web' | 'pc' | 'mobile' | 'unity'
    platform: 'WebGL',
    genre: 'Platformer',
    thumbnail: 'https://images.unsplash.com/photo-1538481143235-5d8015e8bc0f?w=1280&h=720&fit=crop', // Add via admin panel or use URL
    embedUrl: null,     // URL to embed for web games (iframe src)
    downloadUrl: null,  // Download link for PC/mobile games
    description: 'A placeholder game entry. Replace this with your actual game description. Tell players what this game is about, what makes it unique, and why they should play it.',
    howToPlay: [
      'Use WASD or Arrow Keys to move',
      'Press Space to jump',
      'Collect all items to complete the level',
      'Avoid enemies and obstacles'
    ],
    tags: ['Action', '2D', 'Platformer'],
    year: 2024,
    featured: true
  },
  {
    id: 'sample-pc-game',
    title: 'Sample PC Game',
    type: 'pc',
    platform: 'Windows',
    genre: 'Adventure',
    thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1280&h=720&fit=crop',
    embedUrl: null,
    downloadUrl: '#',   // Replace with your Google Drive / itch.io link
    description: 'A downloadable PC game. Add your game description here. This entry shows how downloadable games appear on the site with a download button.',
    howToPlay: [
      'Download and extract the ZIP file',
      'Run the .exe file',
      'Follow in-game instructions'
    ],
    tags: ['Adventure', '3D', 'PC'],
    year: 2024,
    featured: false
  },
  {
    id: 'sample-unity-game',
    title: 'Sample Unity Game',
    type: 'unity',
    platform: 'WebGL',
    genre: 'RPG',
    thumbnail: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=1280&h=720&fit=crop',
    embedUrl: null,
    downloadUrl: null,
    description: 'Made in Unity. Add a description of your Unity game here. Unity WebGL games can be played directly in the browser.',
    howToPlay: [
      'Wait for the game to load',
      'Click to interact',
      'Use WASD to move your character'
    ],
    tags: ['Unity', 'RPG', 'WebGL'],
    year: 2025,
    featured: false
  },
  {
    id: 'uno-no-mercy',
    title: 'UNO: No Mercy',
    type: 'web',
    platform: 'Web',
    genre: 'Card Game',
    thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1280&h=720&fit=crop',
    embedUrl: 'https://uno-no-mercy-72wke9b6g-u2204100-6780s-projects.vercel.app/',
    downloadUrl: null,
    description: 'A high-stakes, ruthless version of the classic UNO card game. Featuring penalty stacking, 0/7 swapping rules, and a custom multiplayer engine.',
    howToPlay: [
      'Draw cards until you match the color or number',
      '+2, +4, +6, and +10 cards can be STACKED',
      'Play a 0 to rotate all hands clockwise',
      'Play a 7 to swap hands with any player',
      'Reach 25 cards and you are ELIMINATED'
    ],
    tags: ['Multiplayer', 'Strategy', 'Card Game', 'Three.js'],
    year: 2024,
    featured: true
  }
]

// ==========================================
// DATA: 3D Models
// Upload your .glb/.gltf files to /public/models/
// ==========================================

export const models = [
  {
    id: 'placeholder-model-1',
    title: 'Character Model',
    description: 'Upload your .glb file to /public/models/ and update the path here.',
    file: null,        // e.g. '/models/character.glb'
    thumbnail: null,
    tags: ['Character', 'Humanoid'],
    software: 'Blender',
    year: 2024,
    polygons: '12,450'
  },
  {
    id: 'placeholder-model-2',
    title: 'Environment Scene',
    description: 'A 3D environment or scene model. Add your GLB file path here.',
    file: null,
    thumbnail: null,
    tags: ['Environment', 'Scene'],
    software: 'Blender',
    year: 2024,
    polygons: '28,300'
  },
  {
    id: 'placeholder-model-3',
    title: 'Prop / Object',
    description: 'A 3D prop or object model. Great for game assets.',
    file: null,
    thumbnail: null,
    tags: ['Prop', 'Game Asset'],
    software: 'Blender',
    year: 2025,
    polygons: '4,200'
  }
]

// ==========================================
// DATA: Animations
// Add YouTube links or local video paths
// ==========================================

export const animations = [
  {
    id: 'anim-1',
    title: 'Animation Reel',
    description: 'My best animation work compiled into a short reel. More to come!',
    youtubeId: null,    // e.g. 'dQw4w9WgXcQ' (the part after youtube.com/watch?v=)
    videoUrl: null,     // local video path e.g. '/videos/reel.mp4'
    thumbnail: null,
    duration: '2:30',
    year: 2024,
    tags: ['Reel', '3D Animation']
  },
  {
    id: 'anim-2',
    title: 'Character Walk Cycle',
    description: 'A smooth walk cycle animation created in Blender.',
    youtubeId: null,
    videoUrl: null,
    thumbnail: null,
    duration: '0:15',
    year: 2024,
    tags: ['Character', 'Loop']
  },
  {
    id: 'anim-3',
    title: 'Environment Flythrough',
    description: 'A cinematic flythrough of a 3D environment.',
    youtubeId: null,
    videoUrl: null,
    thumbnail: null,
    duration: '1:00',
    year: 2025,
    tags: ['Environment', 'Cinematic']
  }
]

// ==========================================
// DATA: Writings
// Add your writing posts here
// ==========================================

export const writingCategories = [
  {
    id: '3am-dump',
    title: '3 A.M. Dump',
    icon: '🌙',
    description: 'Late night thoughts, unfiltered and raw.',
    color: 'purple'
  },
  {
    id: 'beautiful-days',
    title: 'Beautiful Days of My Life',
    icon: '☀️',
    description: 'Memories and moments worth remembering.',
    color: 'cyan'
  },
  {
    id: 'sehri-tales',
    title: 'Sehri Tales',
    icon: '🌙',
    description: 'Stories from the quiet hours before dawn.',
    color: 'pink'
  },
  {
    id: 'reviews',
    title: 'Book & Film Reviews',
    icon: '📖',
    description: 'Honest reviews of books and films that moved me.',
    color: 'green'
  }
]

export const writings = [
  {
    id: '3am-1',
    category: '3am-dump',
    title: 'When the City Sleeps',
    excerpt: 'It\'s 3 a.m. again. The city has gone quiet except for the distant sound of a rickshaw and my own thoughts bouncing off the walls...',
    content: `It's 3 a.m. again. The city has gone quiet except for the distant sound of a rickshaw and my own thoughts bouncing off the walls.

I don't know why I always end up here — at this hour, with a half-eaten packet of biscuits and a screen too bright for my eyes.

Maybe it's because the 3 a.m. version of me is the most honest. There's no performance here. No audience. Just me and whatever I'm pretending not to feel during daylight hours.

Tonight I'm thinking about time. How we spend so much of it waiting — waiting for the right moment, the right person, the right version of ourselves to show up. And then suddenly it's 3 a.m. and you realize you've been waiting your whole life.

I think I need to stop waiting.

I think I need to start building instead.`,
    date: 'March 15, 2025',
    readTime: '3 min read',
    mood: '🌙'
  },
  {
    id: 'beautiful-1',
    category: 'beautiful-days',
    title: 'The Day It Finally Rained',
    excerpt: 'After weeks of oppressive heat, the first rain of the season arrived like an old friend you\'d given up waiting for...',
    content: `After weeks of oppressive heat, the first rain of the season arrived like an old friend you'd given up waiting for.

I was sitting at my desk, staring at a half-finished model in Blender, when I heard it. That first tap on the window. Then another. Then the sky just opened.

I went to the rooftop. I know I should have stayed inside. But there's something about the first rain that makes you want to be in it, not watching it through glass.

The water was warm. Warmer than I expected. And for a few minutes, standing there completely soaked, I felt like nothing bad could exist in a world that had rain like this.

I stayed until my phone died.

Best decision I ever made.`,
    date: 'April 2, 2025',
    readTime: '2 min read',
    mood: '☀️'
  },
  {
    id: 'sehri-1',
    category: 'sehri-tales',
    title: 'Ma\'s Hands at 3:30 AM',
    excerpt: 'Every Ramadan, I wake up to the sound of her in the kitchen. Soft footsteps, the clink of pots, and something always smelling incredibly right...',
    content: `Every Ramadan, I wake up to the sound of her in the kitchen. Soft footsteps, the clink of pots, and something always smelling incredibly right.

Ma is up before all of us. She always has been.

I used to take it for granted — that food would just appear. That the table would just be set. That there would always be someone who loved us enough to lose sleep over it.

This year I sat with her while she cooked. She didn't say much. I didn't either. We just sat in the quiet together while the khichuri bubbled and the city slowly began to wake up.

She asked me how my game was going. I told her almost done.

She smiled and said "inshallah".

I think that's the most peaceful I've felt all year.`,
    date: 'March 25, 2025',
    readTime: '3 min read',
    mood: '🌙'
  },
  {
    id: 'review-1',
    category: 'reviews',
    title: 'Review: Spirited Away (2001)',
    excerpt: 'Miyazaki didn\'t just make a movie. He built a world so complete, so alive, that stepping back into your own reality afterward feels like a small loss...',
    content: `Miyazaki didn't just make a movie. He built a world so complete, so alive, that stepping back into your own reality afterward feels like a small loss.

**Spirited Away** is, simply, one of the greatest films ever made. I know that sounds like hyperbole. It isn't.

The story follows Chihiro, a sulky ten-year-old who gets pulled into the spirit world when her parents are turned into pigs. She must work at a bathhouse for spirits to survive and find a way to free her parents.

What makes it extraordinary isn't the plot — it's the texture. The way the bathhouse operates like a real workplace with politics, hierarchies, and exhausted workers. The way No-Face's loneliness is never explained but perfectly felt. The way Chihiro grows not through grand heroics but through small acts of stubborn kindness.

*Rating: 10/10 — A film that every human being on earth deserves to see.*`,
    date: 'February 10, 2025',
    readTime: '5 min read',
    mood: '📖'
  }
]
