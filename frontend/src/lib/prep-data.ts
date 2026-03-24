export interface STARStory {
    id: string;
    title: string;
    useFor: string[];
    situation: string;
    task: string;
    action: string;
    result: string;
    shortVersion: string;
}

export interface PredictedQuestion {
    id: string;
    question: string;
    probability: 'High' | 'Medium';
    storyId?: string;
}

export interface PrepData {
    role: string;
    company: string;
    competencies: { name: string; evidence: string }[];
    predictedQuestions: PredictedQuestion[];
    starStories: STARStory[];
    pitch: string;
}

export const PREP_DATA: PrepData = {
    role: 'Senior Frontend Engineer',
    company: 'Acme Corp (Fintech)',
    competencies: [
        { name: 'Frontend Architecture & Performance', evidence: 'Optimizing high-frequency data dashboards' },
        { name: 'System Design (Scalability)', evidence: 'Handling complex state and real-time updates' },
        { name: 'Tradeoff Awareness', evidence: 'Previous interview feedback noted this area' },
        { name: 'Leadership & Mentorship', evidence: 'Senior/Lead roles requirement' }
    ],
    predictedQuestions: [
        { id: 'q1', question: 'Tell me about a time you had to optimize a complex React application.', probability: 'High', storyId: 'story1' },
        { id: 'q2', question: 'How do you approach state management in a real-time environment?', probability: 'High', storyId: 'story2' },
        { id: 'q3', question: 'Describe a situation where you had to make a difficult technical tradeoff.', probability: 'High', storyId: 'story3' },
        { id: 'q4', question: 'How do you mentor junior developers?', probability: 'Medium' },
        { id: 'q5', question: 'Tell me about a time you handled a production outage in a critical system.', probability: 'Medium' }
    ],
    starStories: [
        {
            id: 'story1',
            title: 'High-Frequency Dashboard Optimization',
            useFor: ['Performance', 'Problem-Solving', 'Achievement'],
            situation: 'At my current role, our main trading dashboard was lagging, with frame rates dropping to 15fps during peak market hours.',
            task: 'I was tasked with bringing the dashboard back to a consistent 60fps without losing real-time data accuracy.',
            action: 'I implemented React.memo and useDeferredValue for non-critical UI updates. I also moved the heavy data processing to a Web Worker to keep the main thread free. Finally, I throttled the incoming WebSocket messages based on user visibility.',
            result: 'FPS increased from 15 to 60 consistently. Churn among power users dropped by 12%, and we received positive feedback on the snappiness of the UI.',
            shortVersion: 'I led the optimization of a trading dashboard by moving data processing to Web Workers and implementing advanced React memoization, resulting in a 4x FPS improvement and 12% reduction in churn.'
        },
        {
            id: 'story3',
            title: 'Legacy Migration vs. Feature Development (Tradeoff)',
            useFor: ['Tradeoff Awareness', 'Leadership', 'Collaboration'],
            situation: 'Our core dashboard was built on a legacy jQuery/Knockout stack, making new features 3x slower to develop.',
            task: 'I had to convince stakeholders to pause a major feature for 4 weeks to migrate the core logic to Next.js.',
            action: 'I created a POC showing that the migration would reduce bundle size by 60% and development velocity would increase by 2x after the initial month. I negotiated a hybrid approach where we migrated phase-by-phase.',
            result: 'We successfully migrated the core in 5 weeks. Post-migration, we shipped 3 major features in half the time it would have taken on the old stack.',
            shortVersion: 'I navigated a critical tradeoff between feature speed and technical debt by proposing a hybrid migration to Next.js, ultimately doubling team velocity.'
        }
    ],
    pitch: "I’m a Senior Frontend Engineer with 5 years of experience specializing in high-performance web applications, particularly in the fintech space. At my previous roles, I've led projects ranging from real-time data dashboards to large-scale legacy migrations. Most recently, I've been focused on optimizing React application performance and mentoring junior engineers to improve team velocity. I’m particularly excited about this role at Acme Corp because of your focus on specific real-time trading components, where I believe my experience in Web Workers and complex state management can add immediate value."
};
