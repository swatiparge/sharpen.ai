export interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

export interface TopicMetadata {
    topic: string;
    displayName: string;
    language: string;
    category: string;
    whatIsIt: string;
    whereToUse: string;
    realWorldExample: string;
    syntax: string;
    fullLesson?: string;
    questions: Question[];
    upNext?: string[];
    syllabusTopics?: string[];
    interviewTopics?: string[];
}

export const TOPIC_DATA: Record<string, TopicMetadata> = {
    'hoisting': {
        topic: 'hoisting',
        displayName: 'Hoisting',
        language: 'JavaScript',
        category: 'Execution Context',
        whatIsIt: 'Hoisting is a JavaScript mechanism where variables and function declarations are moved to the top of their containing scope during the compilation phase, before the code is executed.',
        whereToUse: 'Understanding hoisting is crucial for avoiding bugs related to variable initialization and function calls. It\'s most commonly relevant when using `var` vs `let`/`const` or function declarations vs expressions.',
        realWorldExample: 'Imagine a "Pre-flight Checklist". Before the plane (code) takes off, the pilot (JS Engine) scans the entire list (scope) and takes note of all the equipment (declarations) available, even if they haven\'t been used yet.',
        syntax: '```javascript\n// Function Hoisting\nsayHello(); // Works!\nfunction sayHello() { console.log("Hello!"); }\n\n// Variable Hoisting (var)\nconsole.log(name); // undefined (not an error)\nvar name = "Sharpen";\n\n// temporal dead zone (let/const)\nconsole.log(age); // ReferenceError\nlet age = 25;\n```',
        fullLesson: `🧠 **What is Hoisting?**

Hoisting is when:
**JavaScript moves variable and function declarations to the top of their scope before executing the code.**

🍪 **Real-Life Example (Very Simple)**
Imagine this:
1. You're preparing for a trip ✈️.
2. Before you leave, your airline (JS Engine) scans your entire luggage (scope).
3. They take note of everything you've packed (declarations) even before you check in.

👉 **Declarations = your packed items**
👉 **JS Engine (Pilot) = scans them first**

💻 **JavaScript Example**
\`\`\`javascript
// Function Hoisting
sayHello(); // Works!
function sayHello() { console.log("Hello!"); }

// Variable Hoisting (var)
console.log(name); // undefined (not an error)
var name = "Sharpen";

// Temporal Dead Zone (let/const)
console.log(age); // ReferenceError
let age = 25;
\`\`\`

🔍 **What’s happening?**
• **Hoisting** only moves the declaration, not the initialization.
• **var** is initialized as \`undefined\`.
• **let/const** are hoisted but stay in the "Temporal Dead Zone" (TDZ) until the code runs.

🧃 **Another Real-Life Analogy**
Think of it like a **pre-flight checklist 📝**.
Everything on the list is "known" before the plane ever leaves the ground.

🎯 **Why Hoisting is Useful**
• **Function calls** can happen before they are defined in the file.
• **Prevents crashing** from simple variable declarations.

🚀 **Simple Use Case**
\`\`\`javascript
// Decoupled code structure
initApp();
function initApp() { console.log("App Started!"); }
\`\`\`

🧠 **One-Line Definition (Interview Ready)**
**Hoisting is JavaScript's default behavior of moving declarations to the top of the current scope.**`,
        questions: [
            {
                question: 'What is the value of a variable declared with `var` if it is accessed before initialization due to hoisting?',
                options: ['ReferenceError', 'undefined', 'null', '0'],
                correctAnswer: 'undefined',
                explanation: 'When a variable is declared with \`var\`, the declaration is hoisted and initialized with \`undefined\`. The assignment itself remains in place.'
            },
            {
                question: 'What happens if you access a `let` variable before its declaration in the code?',
                options: ['It returns undefined', 'It returns null', 'It throws a ReferenceError', 'It works normally'],
                correctAnswer: 'It throws a ReferenceError',
                explanation: 'Variables declared with \`let\` and \`const\` are hoisted but not initialized. They reside in a "Temporal Dead Zone" from the start of the block until the declaration is reached.'
            }
        ],
        upNext: ['Closures', 'Scopes', 'Strict Mode', 'ES6 Classes']
    },
    'closures': {
        topic: 'closures',
        displayName: 'Closures',
        language: 'JavaScript',
        category: 'Core Language',
        whatIsIt: 'A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment).',
        whereToUse: 'Closures are used for data privacy (private variables), function factories, and maintaining state in asynchronous callbacks.',
        realWorldExample: 'Think of a closure like a "backpack". When a function is created, it gets a backpack. Inside it, it stores all the variables from its environment. Even if the function travels far away (is called elsewhere), it still carries that backpack with it.',
        syntax: '```javascript\nfunction outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    return count;\n  };\n}\nconst counter = outer();\nconsole.log(counter()); // 1\nconsole.log(counter()); // 2\n```',
        upNext: ['Event Loop', 'Prototypal Inheritance', 'Promises', 'Module Pattern'],
        fullLesson: `🧠 **What is a Closure?**

A closure is when:
**A function "remembers" variables from where it was created — even after that outer function is finished.**

🍪 **Real-Life Example (Very Simple)**
Imagine this:
1. You go to a bakery 🍰
2. You ask the baker to make a special box with cookies.
3. The baker gives you a box, and inside it: **Cookies 🍪** and a note saying: **"You can add more cookies later"**.

Even after leaving the bakery, you still have access to that box and can keep adding cookies.
👉 **That box = closure**
👉 **The cookies inside = variables stored in memory**

💻 **JavaScript Example**
\`\`\`javascript
function outer() {
  let count = 0;

  function inner() {
    count++;
    console.log(count);
  }

  return inner;
}

const counter = outer();

counter(); // 1
counter(); // 2
counter(); // 3
\`\`\`

🔍 **What’s happening?**
• **outer() runs** → creates \`count = 0\`.
• It returns \`inner()\` function.
• Normally, \`outer()\` should be gone ❌
• But because \`inner()\` uses \`count\`, JavaScript keeps \`count\` alive in memory.
👉 So every time you call \`counter()\`, it remembers \`count\`.

🧃 **Another Real-Life Analogy**
Think of it like a **private locker 🔐**.
• **Outer function** = creates the locker.
• **Inner function** = has the key.
Even if the creator leaves, the person with the key can still access what's inside.

🎯 **Why Closures are Useful**
• **Data privacy** (like private variables)
• **Counters, timers**
• **Event handlers**
• **Maintaining state** without global variables

🚀 **Simple Use Case**
\`\`\`javascript
function createUser(name) {
  return function () {
    console.log("User:", name);
  };
}

const user1 = createUser("Mandira");
user1(); // User: Mandira
\`\`\`
👉 Even after \`createUser\` is done, it remembers "Mandira".

🧠 **One-Line Definition (Interview Ready)**
**A closure is a function that retains access to its lexical scope even after the outer function has executed.**`,
        questions: [
            {
                question: 'What does a closure "capture" from its environment?',
                options: ['Only global variables', 'The entire lexical scope where it was created', 'Only variables explicitly passed to it', 'Nothing, it only has access to its own local variables'],
                correctAnswer: 'The entire lexical scope where it was created',
                explanation: 'Closures retain access to the variables and parameters of the outer function even after that function has finished execution.'
            },
            {
                question: 'Which of the following is a common use case for closures?',
                options: ['Creating private variables', 'Function factories', 'Maintaining state in callbacks', 'All of the above'],
                correctAnswer: 'All of the above',
                explanation: 'Closures are powerful because they allow for data encapsulation and persistent state without cluttering the global scope.'
            }
        ]
    },
    'event-loop': {
        topic: 'event-loop',
        displayName: 'Event Loop',
        language: 'JavaScript',
        category: 'Runtime / Engine',
        whatIsIt: 'The Event Loop is a constant process that checks if the Call Stack is empty and then moves tasks from the Callback Queue and Microtask Queue to the stack.',
        whereToUse: 'It\'s essential for handling asynchronous operations (like API calls or timers) without blocking the main execution thread.',
        realWorldExample: 'Imagine a busy restaurant kitchen. The Event Loop is the "Head Chef" who manages the order of tasks. Some tasks are quick (Synchronous), but others like "Waiting for the oven" (Asynchronous) are handled by assistants, while the Chef continues with the next order.',
        syntax: '```javascript\nconsole.log("Start");\nsetTimeout(() => console.log("Timeout"), 0);\nPromise.resolve().then(() => console.log("Promise"));\nconsole.log("End");\n\n// Output: Start, End, Promise, Timeout\n```',
        fullLesson: `🧠 **What is the Event Loop?**

The Event Loop is when:
**A process checks if the Call Stack is empty and moves tasks from the Callback Queue and Microtask Queue to the stack.**

🍪 **Real-Life Example (Very Simple)**
Imagine this:
1. You're at a busy restaurant 🍔.
2. The **Head Chef** (Event Loop) only takes new orders when the kitchen (Call Stack) is clear.
3. If an order (Async task) takes too long, an assistant handles it while the Chef keeps the flow going.

👉 **Head Chef = Event Loop**
👉 **Kitchen = Call Stack**
👉 **Assistants = Web APIs (Timer, Fetch)**

💻 **JavaScript Example**
\`\`\`javascript
console.log("Start");
setTimeout(() => console.log("Timeout"), 0);
Promise.resolve().then(() => console.log("Promise"));
console.log("End");

// Output: Start, End, Promise, Timeout
\`\`\`

🔍 **What’s happening?**
• **"Start"** and **"End"** go directly to the stack.
• **setTimeout** is sent to the Web APIs (even with 0ms).
• **Promises** go to the "Microtask Queue".
• The Event Loop picks Microtasks before any ordinary Callbacks.
👉 This is why \`Promise\` logs before \`Timeout\`.

🧃 **Another Real-Life Analogy**
Think of it like a **traffic controller 👮‍♂️**.
He only lets cars from the side street through once the main highway is empty.

🎯 **Why the Event Loop is Useful**
• **Non-blocking IO** (doesn't freeze the UI while waiting for an API).
• **High concurrency** on a single thread.

🚀 **Simple Use Case**
\`\`\`javascript
// Fetching data without blocking
fetchData();
console.log("UI still responsive!");
\`\`\`

🧠 **One-Line Definition (Interview Ready)**
**The Event Loop is a mechanism that allows JavaScript to perform non-blocking I/O operations by offloading tasks to the system kernel.**`,
        questions: [
            {
                question: 'In what order are Callbacks and Microtasks (like Promises) executed by the Event Loop?',
                options: ['Microtasks first, then Callbacks', 'Callbacks first, then Microtasks', 'They are executed in the order they were received', 'Callbacks only run if the Microtask queue is empty'],
                correctAnswer: 'Microtasks first, then Callbacks',
                explanation: 'After every task from the Call Stack, the Event Loop processes all available microtasks before moving to the next callback in the Macrotask queue.'
            }
        ],
        upNext: ['Promises vs Async/Await', 'Web Workers', 'Node.js Internals', 'Garbage Collection']
    },
    'cap-theorem': {
        topic: 'cap-theorem',
        displayName: 'CAP Theorem',
        language: 'System Design',
        category: 'Distributed Systems',
        whatIsIt: 'The CAP Theorem states that a distributed system can only provide two of three guarantees: Consistency, Availability, and Partition Tolerance.',
        whereToUse: 'Essential for architecting distributed databases and choosing between systems like Cassandra (AP) vs HBase (CP).',
        realWorldExample: 'A library with two branches where you must decide if they stay open (Availability) or stay perfectly synced (Consistency) when their connection fails.',
        syntax: '```text\nConsistency: All nodes see the same data at the same time.\nAvailability: Every request receives a response (success/failure).\nPartition Tolerance: System continues to operate despite network failures.\n```',
        upNext: ['Database Sharding', 'Load Balancing', 'Microservices Architecture', 'Consensus Algorithms'],
        fullLesson: `🧠 **What is CAP Theorem?**

CAP Theorem is when:
**A distributed system can only provide two of three guarantees: Consistency, Availability, and Partition Tolerance.**

🍪 **Real-Life Example (Very Simple)**
Imagine this:
1. A library has two branches 📚.
2. If the phone line between them is cut (**Partition**), you must choose:
   - Let both keep giving out books but they might have different records (**Availability**).
   - Stop giving out books until the line is fixed so records stay identical (**Consistency**).

👉 **Phone Line = Network Partition**
👉 **Consistency = All branches have the same info**
👉 **Availability = Open for business**

💻 **System Design Example**
\`\`\`text
C: Consistency (All nodes see same data)
A: Availability (System always responds)
P: Partition Tolerance (System works despite network failure)

In real distributed systems, we usually pick CP or AP.
\`\`\`

🔍 **What’s happening?**
• Network partitions (P) are inevitable in distributed systems.
• Therefore, we must choose between **Consistency** OR **Availability** when a partition happens.
👉 You can't have all three at once!

🧃 **Another Real-Life Analogy**
Think of it like a **synced calendar 📅**.
If your phone is offline (Partition), do you want to see your old appointments (Availability) or prevent any changes until you're back online (Consistency)?

🎯 **Why CAP Theorem is Useful**
• **Architectural trade-offs** (helps choose the right database like Cassandra vs. HBase).
• **System reliability** (setting user expectations during failure).

🚀 **Simple Use Case**
\`\`\`text
CP (Consistency/Partition): Financial banking (balance must be exact).
AP (Availability/Partition): Social media feed (okay if a post shows up a bit late).
\`\`\`

🧠 **One-Line Definition (Interview Ready)**
**CAP Theorem states that in the event of a network partition, a distributed system must choose between consistency and availability.**`,
        questions: [
            {
                question: 'Which two guarantees do most traditional SQL databases prioritize over Partition Tolerance?',
                options: ['Consistency and Availability', 'Consistency and Partition Tolerance', 'Availability and Partition Tolerance', 'None of the above'],
                correctAnswer: 'Consistency and Availability',
                explanation: 'Traditional RDBMS like MySQL or PostgreSQL are typically CA systems, though in a distributed context, Partition Tolerance is usually mandatory, forcing a choice between C and A.'
            }
        ]
    },
    'semantic-elements': {
        topic: 'semantic-elements',
        displayName: 'Semantic Elements',
        language: 'HTML',
        category: 'Web Fundamentals',
        whatIsIt: 'Semantic elements are HTML tags that clearly describe their meaning to both the browser and the developer (e.g., <header>, <article>, <footer>).',
        whereToUse: 'Essential for accessibility (screen readers), SEO, and code maintainability.',
        realWorldExample: 'Like labeled jars in a kitchen — the labels tell you what is inside without having to taste everything.',
        syntax: '```html\n<header>\n  <nav>Links</nav>\n</header>\n<main>\n  <article>\n    <h1>Title</h1>\n    <p>Content</p>\n  </article>\n</main>\n<footer>Copyright 2024</footer>\n```',
        upNext: ['Accessibility (A11y)', 'SEO Basics', 'Advanced CSS Selectors', 'Form Validation'],
        fullLesson: `🧠 **What are Semantic Elements?**

Semantic Elements are when:
**HTML tags clearly describe their meaning in a way that is human and machine-readable.**

🍪 **Real-Life Example (Very Simple)**
Imagine this:
1. You're reading a newspaper 📰.
2. Headlines look like headlines, and articles look like articles.
3. If everything was just plain text in boxes (\`<div>\`), you'd have no idea what's important!

👉 **Semantic Tags = Headlines and labels**
👉 **Browsers & SEO = Readers who understand the labels**

💻 **HTML Example**
\`\`\`html
<header>
  <nav>Links</nav>
</header>
<main>
  <article>
    <h1>Title</h1>
    <p>Content</p>
  </article>
</main>
<footer>Copyright 2024</footer>
\`\`\`

🔍 **What’s happening?**
• \`<header>\` tells the browser "this is the top section".
• \`<nav>\` says "here are the links".
• \`<article>\` indicates a standalone piece of content.
👉 This helps search engines and screen readers "understand" the page.

🧃 **Another Real-Life Analogy**
Think of it like **labeled spices in a kitchen 🧂**.
Instead of tasting everything (scanning full text), you just read the label (Semantic Tag) to know what's inside.

🎯 **Why Semantic Elements are Useful**
• **SEO** (Search engines rank structured content better).
• **Accessibility** (Screen readers help visually impaired users navigate).
• **Maintainability** (Clean, readable code for developers).

🚀 **Simple Use Case**
\`\`\`html
<!-- Bad: Low semantic value -->
<div class="header">Title</div>

<!-- Good: High semantic value -->
<header>Title</header>
\`\`\`

🧠 **One-Line Definition (Interview Ready)**
**Semantic HTML is the use of HTML markup to reinforce the meaning of the information in webpages rather than just to define its presentation.**`,
        questions: [
            {
                question: 'Which of the following is a benefit of using semantic elements?',
                options: ['Improved SEO', 'Better accessibility for screen readers', 'More maintainable code', 'All of the above'],
                correctAnswer: 'All of the above',
                explanation: 'Semantic elements provide meaningful information to search engines, browsers, and developers, enhancing the overall quality of the web page.'
            }
        ]
    },
    'flexbox': {
        topic: 'flexbox',
        displayName: 'Flexbox',
        language: 'CSS',
        category: 'Layout',
        whatIsIt: 'The Flexible Box Layout Module makes it easier to design flexible responsive layout structure without using float or positioning.',
        whereToUse: 'Ideal for 1D layouts (rows OR columns) like navigation bars, centering items, and simple grids.',
        realWorldExample: 'Think of Flexbox as a "Smart Elastic Belt". You can easily arrange items in a line and tell them how to stretch to fill space or shrink to fit. It takes care of the math for you.',
        syntax: '```css\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  flex-direction: row;\n}\n```',
        fullLesson: `🧠 **What is Flexbox?**

Flexbox is when:
**You use the CSS Flexible Box Layout to arrange items in a container, even when their size is unknown or dynamic.**

🍪 **Real-Life Example (Very Simple)**
Imagine this:
1. You have a smart elastic belt 👖.
2. No matter how many tools (items) you hang on it, it stretches or shrinks to fit them perfectly.
3. You can tell the belt to "keep everything in the middle" or "spread them out evenly".

👉 **Elastic Belt = Flex Container**
👉 **Tools = Flex Items**

💻 **CSS Example**
\`\`\`css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item {
  flex: 1; /* Grow to fill space */
}
\`\`\`

🔍 **What’s happening?**
• \`display: flex\` turns the container into a flexbox.
• \`justify-content\` controls the horizontal alignment (main axis).
• \`align-items\` controls the vertical alignment (cross axis).
• Items can grow, shrink, and wrap automatically.

🧃 **Another Real-Life Analogy**
Think of it like a **row of seats in a theater 🎭**.
Even if the people (items) are different sizes, the usher (Flexbox) can easily center them or space them out so they fill the row nicely.

🎯 **Why Flexbox is Useful**
• **Easy centering** (horizontal and vertical).
• **Responsive design** (items adjust to screen size).
• **No more floats** or tricky positioning math.
• **1D layouts** (perfect for menus and sidebars).

🚀 **Simple Use Case**
\`\`\`css
/* The "perfect center" */
.box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
\`\`\`

🧠 **One-Line Definition (Interview Ready)**
**Flexbox is a one-dimensional layout model that offers space distribution and alignment capabilities among items in a container.**`,
        questions: [
            {
                question: 'Which property is used to align items vertically in a flex container (on the cross axis)?',
                options: ['justify-content', 'align-items', 'flex-direction', 'align-content'],
                correctAnswer: 'align-items',
                explanation: '`align-items` handles alignment on the cross axis (vertical in a row-based flexbox), while `justify-content` handles the main axis.'
            }
        ],
        upNext: ['CSS Grid Mastery', 'Responsive Design', 'Animations', 'Media Queries']
    }
};

export function getTopicMetadata(topic: string): TopicMetadata {
    const normalized = topic.toLowerCase().trim().replace(/[ _]/g, '-');
    
    if (TOPIC_DATA[normalized]) {
        return TOPIC_DATA[normalized];
    }

    // Smart fallback for JS topics
    const jsKeywords = ['hoisting', 'closure', 'event-loop', 'promise', 'async', 'await', 'prototype', 'scope', 'this', 'bind', 'call', 'apply'];
    const isJS = jsKeywords.some(key => normalized.includes(key));

    return {
        topic: normalized,
        displayName: normalized.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        language: isJS ? 'JavaScript' : 'General Concept',
        category: isJS ? 'Language Fundamentals' : 'Interview Preparation',
        whatIsIt: `We'll explore the core mechanics of ${normalized} and how it applies to modern software engineering.`,
        whereToUse: `This concept is frequently tested in technical interviews to assess your understanding of fundamental principles.`,
        realWorldExample: `Imagine you're building a scalable application and need to decide if ${normalized} is the right approach for your specific problem.`,
        syntax: `\`\`\`text\n// Concept: ${normalized}\n// Details to be explored...\n\`\`\``,
        questions: [
            {
                question: `Which of the following describes the primary benefit of understanding ${normalized}?`,
                options: ['Faster execution time', 'Better code organization', 'Improved scalability', 'All of the above'],
                correctAnswer: 'All of the above',
                explanation: 'Understanding fundamental concepts helps in writing cleaner, more efficient, and scalable code.'
            }
        ],
        upNext: isJS ? ['Closures', 'Async/Await', 'Memory Management'] : ['System Design basics', 'STAR Method', 'Data Structures']
    };
}
