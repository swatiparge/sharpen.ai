import json
from pipeline.qa_extractor import _get_client
from pydantic import BaseModel

class TopicMetadata(BaseModel):
    topic: str
    displayName: str
    language: str
    category: str
    whatIsIt: str
    whereToUse: str
    realWorldExample: str
    syntax: str
    fullLesson: str
    questions: list
    syllabusTopics: list
    interviewTopics: list
from pipeline.utils import retry_llm_call

@retry_llm_call(max_retries=3, initial_wait=2, backoff=2)
def generate_topic_lesson(topic: str) -> dict:
    client = _get_client()
    
    system_prompt = """You are an expert programming tutor. 
Given a topic, identify its primary programming language, framework, or technical domain (e.g., HTML, CSS, React, Python, System Design, etc.).
Generate a comprehensive, engaging lesson about this topic.
CRITICAL INSTRUCTION: Your response MUST be valid JSON. All newlines inside strings MUST be escaped as `\n`. DO NOT write literal unescaped newlines inside strings! Always use `\n` for line breaks. Escape all double quotes properly inside your string values!

Your response MUST exactly match this JSON schema:
{
    "topic": "lowercase-kebab-case-string",
    "displayName": "Formatted Display Name",
    "language": "Primary Language or Framework (e.g., Python, React, System Design)",
    "category": "Broad Category (e.g., Frontend, Backend, Architecture)",
    "whatIsIt": "1-2 sentence simple explanation of what this is",
    "whereToUse": "1-2 sentence explanation of when/where to use it",
    "realWorldExample": "A relatable real-world analogy. Must be a valid JSON string.",
    "syntax": "A completely valid JSON string representing the basic syntax. If you show code, escape all newlines as \\n and double quotes as \\\". Do NOT use raw unescaped markdown blocks (like ```) outside of strings.",
    "fullLesson": "A comprehensive lesson in Markdown. MUST be a valid JSON string enclosed in double quotes. All newlines inside MUST be escaped as \\n. Do not simply drop raw markdown unescaped.",
    "questions": [
        {
            "question": "A multiple choice interview question about this topic",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "The exact string of the correct option",
            "explanation": "Why this answer is correct"
        }
    ],
    "syllabusTopics": ["Related Topic 1", "Related Topic 2", "Related Topic 3", "Related Topic 4"],
    "interviewTopics": ["Most Asked Topic 1", "Most Asked Topic 2", "Most Asked Topic 3"]
}"""

    try:
        response = client.chat.completions.create(
            model="meta/llama-3.1-70b-instruct",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Generate a lesson for the topic: {topic}"}
            ],
            temperature=0.6,
            max_tokens=2500,
            response_format={"type": "json_object"}
        )
        
        import re
        
        content = response.choices[0].message.content.strip()
        
        # Strip markdown wrapping if LLM outputted ```json ... ```
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        # Robustly extract JSON block in case the LLM wrapped it in conversation or markdown
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            content = json_match.group(0)
            
        return json.loads(content, strict=False)
    except Exception as e:
        dump = (content if 'content' in locals() else 'None')
        print(f"[Learn Generator] Failed to parse model output. Error: {e}")
        print(f"[Learn Generator] Raw output snippet (first 500 chars): {dump[:500]}")
        raise e
