"""
Prompt 模板系統
"""

# 預設 prompt 模板
DEFAULT_PROMPTS = {
    1: {
        "name": "教學理念生成",
        "type": "rationale",
        "content": """請根據以下基本課程資訊，撰寫一份完整的教學理念。

基本資訊：
- 課程標題：{title}
- 年級：{grade}
- 課程時長：{duration} 分鐘
- 學生人數：{student_count}
- 教室設備：{classroom_equipment}
{upload_content}

請包含以下內容：
1. 為何選此主題
2. 學生起點分析（先備知識、經驗、困難、動機）
3. 教學價值（知識、技能、情意、應用）
4. 跨領域連結

請以結構化的方式呈現。""",
        "variables": ["title", "grade", "duration", "student_count", "classroom_equipment", "upload_content"]
    },
    2: {
        "name": "學習目標生成",
        "type": "objectives",
        "content": """請根據以下資訊，生成完整的學習目標。

課程資訊：
- 課程標題：{title}
- 年級：{grade}

教學理念：
{rationale}

請生成以下三大類型的學習目標：
1. 認知目標（Cognitive）：理解、分析等
2. 技能目標（Psychomotor）：操作、示範等
3. 情意目標（Affective）：欣賞、展現等

每個目標請包含：
- 目標描述
- 評量方式
- 驗收標準

請以結構化的方式呈現。""",
        "variables": ["title", "grade", "rationale"]
    },
    3: {
        "name": "教學策略推薦",
        "type": "strategies",
        "content": """請根據以下資訊，推薦五種適合的教學方法。

課程資訊：
- 課程標題：{title}
- 年級：{grade}
- 課程時長：{duration} 分鐘

教學理念：
{rationale}

學習目標：
{objectives}

請推薦五種教學策略，每個策略請包含：
1. 教學方法名稱
2. 選擇理由
3. 實施建議
4. 預期效果

請以條列式呈現。""",
        "variables": ["title", "grade", "duration", "rationale", "objectives"]
    },
    4: {
        "name": "教學流程設計",
        "type": "flow",
        "content": """請根據以下資訊，設計完整的教學流程。

課程資訊：
- 課程標題：{title}
- 課程時長：{duration} 分鐘

教學理念：{rationale}

學習目標：{objectives}

教學策略：{strategies}

請設計詳細的教學流程，包含：
1. 時間分配（引起動機、概念教學、實作、總結）
2. 各階段活動內容
3. 教師與學生行動
4. 檢核點
5. 所需材料

請以表格或結構化的方式呈現。""",
        "variables": ["title", "duration", "rationale", "objectives", "strategies"]
    },
    5: {
        "name": "PPT 生成",
        "type": "ppt",
        "content": """請根據以下教學流程，設計 PowerPoint 簡報的大綱。

課程標題：{title}

教學流程：
{teaching_flow}

請設計 PPT 大綱，包含：
1. 封面
2. 課程目標
3. 各階段內容（對應教學流程）
4. 總結與反思

請以條列式呈現每張簡報的標題和重點內容。""",
        "variables": ["title", "teaching_flow"]
    },
    6: {
        "name": "學習單生成",
        "type": "worksheet",
        "content": """請根據以下教學流程，設計學習單。

課程標題：{title}

教學流程：
{teaching_flow}

學習目標：{objectives}

請設計學習單，包含：
1. 課程資訊
2. 學習目標
3. 活動任務
4. 自我評量
5. 教師評量欄位

請以結構化的方式呈現。""",
        "variables": ["title", "teaching_flow", "objectives"]
    }
}


def get_prompt(step_number: int) -> dict:
    """獲取指定步驟的 prompt 模板"""
    return DEFAULT_PROMPTS.get(step_number, {})


def get_all_prompts() -> dict:
    """獲取所有 prompt 模板"""
    return DEFAULT_PROMPTS
