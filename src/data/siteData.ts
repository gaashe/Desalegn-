export const blogPosts = [  
  {  
    id: 1,  
    title: "Building Scalable Web Applications with Next.js 14",  
    excerpt:  
      "Explore the latest features of Next.js 14 and learn how to architect applications that scale effortlessly from prototype to production.",  
    date: "2026-06-15",  
    category: "Tutorial",  
    readTime: "8 min read",  
    slug: "scalable-nextjs-14",  
    content: [  
      "Next.js 14 introduced major improvements that make it easier than ever to build fast, scalable web applications. In this article we walk through the features that matter most when your project grows from a small prototype into a production system serving thousands of users.",  
      "The App Router encourages you to think in terms of server components by default. This reduces the JavaScript sent to the browser and speeds up page loads. We look at how to decide which components should run on the server and which need to be client components.",  
      "Caching is another area where Next.js 14 shines. Understanding how the framework caches data and rendered output lets you serve pages instantly while still keeping content fresh. We cover practical patterns you can apply today.",  
      "Finally, we discuss deployment. Hosting on a platform that supports the App Router means your app scales automatically with traffic, so you can focus on building features instead of managing servers.",  
    ],  
  },  
  {  
    id: 2,  
    title: "Tailwind CSS Best Practices for Production",  
    excerpt:  
      "Master Tailwind CSS with proven patterns, component abstractions, and performance optimization techniques used in real-world projects.",  
    date: "2026-06-01",  
    category: "Best Practices",  
    readTime: "6 min read",  
    slug: "tailwind-best-practices",  
    content: [  
      "Tailwind CSS has become the go-to styling solution for modern web apps because it keeps your styles close to your markup and removes the guesswork of naming CSS classes. But using it well in a large project takes discipline.",  
      "The first best practice is to extract repeated class combinations into reusable components rather than copying long class lists around. This keeps your code readable and makes design changes easy.",  
      "Next, take advantage of your Tailwind config to define a consistent design system: your colors, spacing, and font sizes should live in one place so the whole site feels cohesive.",  
      "Finally, make sure the production build purges unused classes so your CSS file stays small and your pages load quickly. This step is what keeps Tailwind fast even on large sites.",  
    ],  
  },  
  {  
    id: 3,  
    title: "Designing Tutoring Platforms That Students Love",  
    excerpt:  
      "Key UX principles and technical decisions that make the difference between a good and great e-learning experience.",  
    date: "2026-05-20",  
    category: "Case Study",  
    readTime: "10 min read",  
    slug: "tutoring-platform-design",  
    content: [  
      "Building an online tutoring platform is about far more than video calls. The best platforms feel welcoming, reduce friction for both students and teachers, and keep learners coming back.",  
      "Start with a simple, clear onboarding flow. Students should be able to find a tutor and book a session in just a few taps, without confusion. Every extra step is a chance for someone to give up.",  
      "Progress tracking is a feature students genuinely love. Showing how far they have come, what they have mastered, and what comes next keeps motivation high and turns one-off users into regulars.",  
      "On the technical side, reliable notifications and a fast, responsive interface matter enormously. A platform that works smoothly on a phone will reach far more students than one that only works well on desktop.",  
    ],  
  },  
  {  
    id: 4,  
    title: "PostgreSQL Performance Tips for Web Developers",  
    excerpt:  
      "Practical indexing strategies, query optimization, and connection pooling techniques to keep your database fast under load.",  
    date: "2026-05-05",  
    category: "Tutorial",  
    readTime: "7 min read",  
    slug: "postgresql-performance",  
    content: [  
      "As your web application grows, the database is often the first thing to slow down. PostgreSQL is powerful, but getting the best performance out of it requires understanding a few key concepts.",  
      "Indexing is the single most important tool. Adding the right indexes to the columns you filter and sort by can turn a slow query into an instant one. But too many indexes slow down writes, so choose carefully.",  
      "Writing efficient queries matters just as much. Avoid fetching more data than you need, and use the query planner to understand how PostgreSQL is executing your requests.",  
      "Finally, use connection pooling in production. Opening a new database connection for every request is expensive; a pool reuses connections and keeps your app responsive under heavy load.",  
    ],  
  },  
  {  
    id: 5,  
    title: "From Freelancer to Agency: Scaling Your Web Dev Business",  
    excerpt:  
      "Lessons learned growing from solo freelancing to running a development team, including pricing, processes, and client management.",  
    date: "2026-04-18",  
    category: "Business",  
    readTime: "9 min read",  
    slug: "freelancer-to-agency",  
    content: [  
      "Making the jump from solo freelancer to running a small agency is exciting, but it changes almost everything about how you work. Here are the lessons that made the biggest difference.",  
      "Pricing is the first thing to rethink. As a freelancer you sell your hours; as an agency you sell outcomes and a team. Moving to value-based pricing lets you grow without simply working more hours.",  
      "Processes become essential. When it is just you, everything lives in your head. With a team, you need clear steps for how projects start, how work is reviewed, and how clients are kept informed.",  
      "Finally, focus on client relationships. Repeat clients and referrals are the lifeblood of an agency. Delivering consistently and communicating clearly is what turns a one-time project into a long-term partnership.",  
    ],  
  },  
];
