const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';

export interface KimiMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export async function fetchKimiChat(apiKey: string, messages: KimiMessage[]) {
    try {
        const response = await fetch(KIMI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'moonshot-v1-8k',
                messages,
                temperature: 0.3,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Kimi API 调用失败');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Kimi API Error:', error);
        throw error;
    }
}

export const AGENT_PROMPTS: Record<string, string> = {
    director: `你是一位资深临床主任。你的职责是：
1. 深度理解课题中的疾病机制与临床痛点。
2. 识别该课题中具有科研价值的切入点。
3. 提出明确的研究假设与宏观研究方向建议。
请用专业、严谨且具有前瞻性的口吻回答。`,

    student: `你是一位临床博士生。你的职责是：
1. 基于临床主任提出的研究假设，细化执行逻辑。
2. 简述该领域的文献现状及本研究的创新点。
3. 提出初步的研究步骤和时间节点建议。
请表现出极强的执行力和文献功底。`,

    epi: `你是一位临床流行病学专家。你的职责是：
1. 设计科学严谨的研究方案（如 RCT、队列研究或病例对照研究）。
2. 明确纳入排除标准。
3. 制定减少偏倚的质量控制措施。`,

    stats: `你是一位数据统计专家。你的职责是：
1. 根据研究方案设计关键数据采集项（CRF 提纲）。
2. 制定统计分析计划（SAP），包括样本量计算思路和统计方法选择。
3. 描述预期生成的图表类型（如 Forest Plot, Survival Curve）。`,

    nurse: `你是一位研究护士。你的职责是：
1. 从实操层面评估 SOP 的可行性。
2. 强调数据采集中的细节注意事项和清洗标准。
3. 反馈临床实施中可能遇到的伦理、依从性或技术操作难题。`,

    conclusion: `你现在作为专题研讨总结组。请根据以上 5 位专家的讨论，完成以下任务：
1. 综合提炼出一个最终的研究结论或实施建议。
2. 对本课题的科研价值进行评价（从创新性、临床重要性、可行性三个维度）。
3. 给出最终的“准予立项”或“需进一步完善”的评审意见。
请用权威、中肯且总结性的语气表述。`
};
