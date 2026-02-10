import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { fetchKimiChat, AGENT_PROMPTS } from './services/kimi';

interface Message {
  role: string;
  name: string;
  content: string;
  id: string;
}

interface Agent {
  id: string;
  title: string;
  name: string;
  description: string;
  avatar: string;
  color: string;
}

const AGENTS: Agent[] = [
  { id: 'director', title: '资深临床主任', name: 'Dr. Zhang', description: '深度理解疾病机制与临床痛点，识别具有科研价值的问题。', avatar: '🩺', color: '#38bdf8' },
  { id: 'student', title: '临床博士生', name: 'Dr. Lee', description: '执行主任思路，统筹文献检索与各环节推进。', avatar: '🎓', color: '#818cf8' },
  { id: 'epi', title: '临床流行病学专家', name: 'Prof. Wang', description: '设计科学严谨的研究方案，制定质量控制措施。', avatar: '📊', color: '#fb923c' },
  { id: 'stats', title: '数据统计专家', name: 'Dr. Chen', description: '设计 CRF 表格，制定统计分析计划并生成图表。', avatar: '📉', color: '#2dd4bf' },
  { id: 'nurse', title: '研究护士', name: 'Nurse Su', description: '执行数据采集，质量核查与清洗，反馈实操问题。', avatar: '🏥', color: '#f472b6' },
  { id: 'conclusion', title: '专题研讨总结', name: 'Expert Panel', description: '基于以上各环节讨论得出最终结论，评价课题价值。', avatar: '🏆', color: '#eab308' },
];

const FIXED_API_KEY = 'sk-XHyKiEIdTFpzjTXKcKE82wqPXnWIUladY3ha4EhpudiFBoV9';

function App() {
  const [topic, setTopic] = useState('');
  const [isDiscussing, setIsDiscussing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeAgentIndex, setActiveAgentIndex] = useState(-1);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startDiscussion = async () => {
    if (!topic.trim()) return;

    setIsDiscussing(true);
    setMessages([]);

    let currentContext: { role: 'system' | 'user' | 'assistant', content: string }[] = [
      { role: 'user', content: `我们要讨论的课题是：${topic}` }
    ];

    for (let i = 0; i < AGENTS.length; i++) {
      setActiveAgentIndex(i);
      const agent = AGENTS[i];

      try {
        const systemPrompt = AGENT_PROMPTS[agent.id];
        const messagesForKimi: any[] = [
          { role: 'system', content: systemPrompt },
          ...currentContext
        ];

        const response = await fetchKimiChat(FIXED_API_KEY, messagesForKimi);

        const newMessage: Message = {
          id: Date.now().toString() + i,
          role: agent.id,
          name: agent.title,
          content: response,
        };

        setMessages(prev => [...prev, newMessage]);
        currentContext.push({ role: 'assistant', content: `【${agent.title}】的意见：${response}` });
      } catch (error: any) {
        alert(`在 ${agent.title} 环节发生错误: ${error.message}`);
        break;
      }
    }

    // Final conclusion from the 'conclusion' agent
    const consensusAgent = AGENTS.find(agent => agent.id === 'conclusion');
    if (consensusAgent) {
      setActiveAgentIndex(AGENTS.indexOf(consensusAgent));
      try {
        const systemPrompt = AGENT_PROMPTS[consensusAgent.id];
        const messagesForKimi: any[] = [
          { role: 'system', content: systemPrompt },
          ...currentContext
        ];

        const response = await fetchKimiChat(FIXED_API_KEY, messagesForKimi);

        const newMessage: Message = {
          id: Date.now().toString() + 'conclusion',
          role: consensusAgent.id,
          name: consensusAgent.title,
          content: response,
        };

        setMessages(prev => [...prev, newMessage]);
      } catch (error: any) {
        alert(`在 ${consensusAgent.title} 环节发生错误: ${error.message}`);
      }
    }

    setIsDiscussing(false);
    setActiveAgentIndex(-1);
  };

  return (
    <div className="app-container">
      <header className="header glass">
        <div className="logo">
          <span className="logo-icon">🧬</span>
          <h1>临床 AI 研究研讨平台</h1>
        </div>
        <div className="status-badge">在线研讨室</div>
      </header>

      <main className="main-content">
        <section className="input-section glass">
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="请输入您想要讨论的临床科研课题..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isDiscussing}
            />
            <button
              onClick={startDiscussion}
              disabled={isDiscussing || !topic.trim()}
              className={isDiscussing ? 'loading' : ''}
            >
              {isDiscussing ? '研讨中...' : '开始联合研讨'}
            </button>
          </div>
        </section>

        <section className="agents-grid">
          {AGENTS.map((agent, index) => (
            <div
              key={agent.id}
              className={`agent-card glass ${activeAgentIndex === index ? 'active' : ''}`}
              style={{ '--agent-color': agent.color } as React.CSSProperties}
            >
              <div className="agent-avatar">{agent.avatar}</div>
              <div className="agent-info">
                <h3>{agent.title}</h3>
                <p className="agent-desc">{agent.description}</p>
              </div>
              {activeAgentIndex === index && <div className="typing-indicator">思考中...</div>}
            </div>
          ))}
        </section>

        <section className="discussion-area glass">
          <div className="area-header">
            <h2>讨论纪要</h2>
            <div className="dots"><span></span><span></span><span></span></div>
          </div>
          <div className="chat-flow">
            {messages.length === 0 && !isDiscussing && (
              <div className="empty-state">
                等待课题输入，开启专家联合研讨...
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className="message-item">
                <div className="msg-header">
                  <span className="msg-name">{msg.name}</span>
                  <span className="msg-time">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="msg-content">{msg.content}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
