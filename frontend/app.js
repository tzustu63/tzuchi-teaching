/**
 * 課程計劃生成器 - 前端應用
 */

const DEFAULT_LOCAL_API = "http://localhost:8000";
const API_BASE_URL =
  typeof window !== "undefined" &&
  window.location &&
  window.location.hostname &&
  !/(localhost|127\.0\.0\.1)/.test(window.location.hostname)
    ? ""
    : DEFAULT_LOCAL_API;

// 初始化
let currentStep = 1;
let courseData = {};
let currentLanguage = localStorage.getItem("language") || "zh";

// 確保 marked 函數可用的輔助函數
function renderMarkdown(content) {
  if (!content) return '';
  // 確保 marked 已載入
  if (typeof marked === 'undefined') {
    console.error('marked is not defined');
    return content;
  }
  // 相容不同版本的 marked API
  return typeof marked.parse === 'function' ? marked.parse(content) : marked(content);
}

// 翻譯內容
const translations = {
  zh: {
    title: "課程計劃生成器",
    subtitle: "AI 驅動的完整課程計劃工具",
    step1: "基本資訊",
    step2: "教學理念",
    step3: "學習目標",
    step4: "教學策略",
    step5: "教學流程",
    step6: "教學材料",
    step7: "製作學習單",
    welcome: "歡迎使用課程計劃生成器",
    features: "功能特色",
    start: "開始使用",
    currentLang: "中文",
    switchTo: "English",
    aiModel: "AI 模型",
    subModel: "子模型",
    promptEdit: "Prompt 編輯",
    step1Title: "步驟 1: 基本課程資訊",
    step2Title: "步驟 2: 教學理念",
    step3Title: "步驟 3: 學習目標",
    step4Title: "步驟 4: 教學策略",
    step5Title: "步驟 5: 教學流程",
    step6Title: "步驟 6: 教學材料",
    step7Title: "步驟 7: 製作學習單",
    nextStep: "下一步：",
    edit: "編輯",
    regenerate: "重新生成",
    download: "下載學習單",
    generateMaterials: "製作簡報",
    generateWorksheet: "製作學習單",
    courseTitle: "課程標題",
    grade: "年級",
    courseDuration: "課程時長（分鐘）",
    studentCount: "學生人數",
    classroomEquipment: "教室設備",
    lessonPlanContent: "教案內容（選填）",
    pleaseSelect: "請選擇",
    gradeOptions:
      "小班,中班,大班,一年級,二年級,三年級,四年級,五年級,六年級,七年級,八年級,九年級,高一,高二,高三",
    equipmentPlaceholder: "例如: 投影機、電腦、白板",
    supportedFormats: "支援格式: .docx, .pdf, .txt（最大 10MB）",
    nextRationale: "下一步：生成教學理念",
    nextObjectives: "下一步：生成學習目標",
    nextStrategies: "下一步：生成教學策略",
    nextFlow: "下一步：生成教學流程",
    gammaSettings: "Gamma 設定",
    closeSettings: "關閉設定",
    downloadAll: "下載所有材料",
    chooseFile: "選擇檔案",
    noFileChosen: "未選擇任何檔案",
  },
  en: {
    title: "Lesson Plan Generator",
    subtitle: "AI-powered complete course planning tool",
    step1: "Basic Info",
    step2: "Teaching Philosophy",
    step3: "Learning Objectives",
    step4: "Teaching Strategies",
    step5: "Teaching Flow",
    step6: "Teaching Materials",
    step7: "Create Worksheets",
    welcome: "Welcome to Lesson Plan Generator",
    features: "Features",
    start: "Start Using",
    currentLang: "English",
    switchTo: "中文",
    aiModel: "AI Model",
    subModel: "Sub Model",
    promptEdit: "Prompt Editor",
    step1Title: "Step 1: Basic Course Information",
    step2Title: "Step 2: Teaching Philosophy",
    step3Title: "Step 3: Learning Objectives",
    step4Title: "Step 4: Teaching Strategies",
    step5Title: "Step 5: Teaching Flow",
    step6Title: "Step 6: Teaching Materials",
    step7Title: "Step 7: Create Worksheets",
    nextStep: "Next Step: ",
    edit: "Edit",
    regenerate: "Regenerate",
    download: "Download Worksheet",
    generateMaterials: "Create Presentation",
    generateWorksheet: "Create Worksheet",
    courseTitle: "Course Title",
    grade: "Grade",
    courseDuration: "Course Duration (minutes)",
    studentCount: "Number of Students",
    classroomEquipment: "Classroom Equipment",
    lessonPlanContent: "Lesson Plan Content (Optional)",
    pleaseSelect: "Please select",
    gradeOptions:
      "K1 (Kindergarten),K2 (Kindergarten),K3 (Kindergarten),Grade 1,Grade 2,Grade 3,Grade 4,Grade 5,Grade 6,Grade 7,Grade 8,Grade 9,Grade 10,Grade 11,Grade 12",
    equipmentPlaceholder: "e.g., Projector, Computer, Whiteboard",
    supportedFormats: "Supported formats: .docx, .pdf, .txt (max 10MB)",
    nextRationale: "Next Step: Generate Teaching Philosophy",
    nextObjectives: "Next Step: Generate Learning Objectives",
    nextStrategies: "Next Step: Generate Teaching Strategies",
    nextFlow: "Next Step: Generate Teaching Flow",
    gammaSettings: "Gamma Settings",
    closeSettings: "Close Settings",
    downloadAll: "Download All Materials",
    chooseFile: "Choose File",
    noFileChosen: "No file chosen",
  },
};

// DOM 載入後初始化
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  applyLanguage(currentLanguage);
});

function initializeApp() {
  // 初始化側邊欄
  initializeSidebar();

  // 初始化側邊欄 AI 模型選擇器
  const sidebarModelSelect = document.getElementById("sidebar-ai-model-select");
  const sidebarSubmodelSelect = document.getElementById(
    "sidebar-ai-submodel-select"
  );
  const mainModelSelect = document.getElementById("ai-model-select");
  const startUsingBtn = document.getElementById("start-using");

  if (sidebarModelSelect && sidebarSubmodelSelect) {
    // 更新子模型選項
    const updateSubmodelOptions = (provider) => {
      const options = sidebarSubmodelSelect.querySelectorAll("option");
      options.forEach((option) => {
        const optionProvider = option.getAttribute("data-provider");
        if (optionProvider === provider) {
          option.style.display = "";
        } else {
          option.style.display = "none";
        }
      });

      // 選取該提供商的第一個模型作為預設
      const firstVisibleOption = sidebarSubmodelSelect.querySelector(
        `option[data-provider="${provider}"]:not([style*="display: none"])`
      );
      if (firstVisibleOption) {
        sidebarSubmodelSelect.value = firstVisibleOption.value;
        localStorage.setItem("ai_submodel", firstVisibleOption.value);
      }
    };

    // 當主模型改變時，更新子模型選項
    sidebarModelSelect.addEventListener("change", (e) => {
      const selectedProvider = e.target.value;
      updateSubmodelOptions(selectedProvider);
      localStorage.setItem("ai_model", selectedProvider);

      // 同步到主選擇器（如果存在）
      if (mainModelSelect) {
        mainModelSelect.value = selectedProvider;
      }
    });

    // 當子模型改變時，保存選擇
    sidebarSubmodelSelect.addEventListener("change", (e) => {
      localStorage.setItem("ai_submodel", e.target.value);
      console.log(`📡 已選擇子模型: ${e.target.value}`);
    });

    // 載入已儲存的選擇
    let savedModel = localStorage.getItem("ai_model") || "openai";
    if (savedModel !== "openai") {
      savedModel = "openai";
      localStorage.setItem("ai_model", savedModel);
    }

    let savedSubmodel = localStorage.getItem("ai_submodel");
    if (!savedSubmodel || savedSubmodel.startsWith("claude")) {
      savedSubmodel = "gpt-4o-mini";
      localStorage.setItem("ai_submodel", savedSubmodel);
    }

    sidebarModelSelect.value = savedModel;
    updateSubmodelOptions(savedModel);

    // 如果有保存的子模型，則使用它
    if (savedSubmodel) {
      sidebarSubmodelSelect.value = savedSubmodel;
    }

    if (mainModelSelect) {
      mainModelSelect.value = savedModel;
    }
  }

  // 開始使用按鈕
  if (startUsingBtn) {
    startUsingBtn.addEventListener("click", () => {
      const selectedModel = sidebarModelSelect?.value || "openai";
      localStorage.setItem("ai_model", selectedModel);
      document.getElementById("api-key-section").style.display = "none";
      document.getElementById("workflow-container").style.display = "block";
    });
  }

  // 基本資訊表單
  document
    .getElementById("basic-info-form")
    .addEventListener("submit", handleBasicInfoSubmit);

  // Step 2: 教學理念
  document
    .getElementById("confirm-rationale")
    .addEventListener("click", async () => {
      // 顯示生成中狀態
      setGeneratingState("confirm-rationale", true, "下一步：生成中...");
      try {
        await generateObjectives();
        proceedToStep(3);
      } finally {
        setGeneratingState(
          "confirm-rationale",
          false,
          currentLanguage === "en"
            ? "Next: Generate Learning Objectives"
            : "下一步：生成學習目標"
        );
      }
    });
  document
    .getElementById("regenerate-rationale")
    .addEventListener("click", regenerateRationale);
  document
    .getElementById("edit-rationale")
    .addEventListener("click", () => editContent("rationale"));

  // Step 3: 學習目標
  document
    .getElementById("confirm-objectives")
    .addEventListener("click", async () => {
      // 顯示生成中狀態
      setGeneratingState("confirm-objectives", true, "下一步：生成中...");
      try {
        await generateStrategies();
        proceedToStep(4);
      } finally {
        setGeneratingState(
          "confirm-objectives",
          false,
          currentLanguage === "en"
            ? "Next: Generate Teaching Strategies"
            : "下一步：生成教學策略"
        );
      }
    });
  document
    .getElementById("regenerate-objectives")
    .addEventListener("click", regenerateObjectives);
  document
    .getElementById("edit-objectives")
    .addEventListener("click", () => editContent("objectives"));

  // Step 4: 教學策略
  document
    .getElementById("confirm-strategies")
    .addEventListener("click", async () => {
      // 顯示生成中狀態
      setGeneratingState("confirm-strategies", true, "下一步：生成中...");
      try {
        await generateFlow();
        proceedToStep(5);
      } finally {
        setGeneratingState(
          "confirm-strategies",
          false,
          currentLanguage === "en"
            ? "Next: Generate Teaching Flow"
            : "下一步：生成教學流程"
        );
      }
    });
  document
    .getElementById("regenerate-strategies")
    .addEventListener("click", regenerateStrategies);
  document
    .getElementById("edit-strategies")
    .addEventListener("click", () => editContent("strategies"));

  // Step 5: 教學流程
  document
    .getElementById("generate-materials")
    .addEventListener("click", async () => {
      // 顯示生成中狀態
      const button = document.getElementById("generate-materials");
      const originalText = button.textContent;
      const statusText =
        currentLanguage === "en" ? "Creating presentation..." : "製作簡報中...";
      setGeneratingState("generate-materials", true, statusText);
      try {
        await generateMaterials();
      } finally {
        setGeneratingState("generate-materials", false, originalText);
      }
    });
  document
    .getElementById("regenerate-flow")
    .addEventListener("click", regenerateFlow);
  document
    .getElementById("edit-flow")
    ?.addEventListener("click", () => editContent("flow"));
  document
    .getElementById("toggle-gamma-settings")
    .addEventListener("click", toggleGammaSettings);

  // Step 6: 教學材料
  document
    .getElementById("generate-worksheets")
    .addEventListener("click", async () => {
      // 顯示生成中狀態
      setGeneratingState("generate-worksheets", true, "下一步：生成中...");
      try {
        await generateWorksheets();
        proceedToStep(7);
      } finally {
        setGeneratingState(
          "generate-worksheets",
          false,
          currentLanguage === "en"
            ? "Next: Create Worksheet"
            : "下一步：製作學習單"
        );
      }
    });

  // Step 7: 製作學習單
  document
    .getElementById("regenerate-worksheet")
    .addEventListener("click", regenerateWorksheet);
  document
    .getElementById("edit-worksheet")
    .addEventListener("click", () => editContent("worksheet"));
  document
    .getElementById("download-worksheet")
    .addEventListener("click", downloadWorksheet);

  // Prompt 編輯器
  initializePromptEditor();

  // 檢查是否有儲存的 API Key
  checkAPIKey();

  // 初始化側邊欄高亮
  updateSidebarHighlight();
}

function checkAPIKey() {
  const aiModel = localStorage.getItem("ai_model") || "openai";

  // 設置側邊欄模型選擇器
  const sidebarModelSelect = document.getElementById("sidebar-ai-model-select");
  if (sidebarModelSelect) {
    sidebarModelSelect.value = aiModel;
  }

  // 如果已經選擇過模型，直接顯示工作流程
  document.getElementById("workflow-container").style.display = "block";
  document.getElementById("api-key-section").style.display = "none";
}

function saveAPIKey() {
  const sidebarModelSelect = document.getElementById("sidebar-ai-model-select");
  const aiModel = sidebarModelSelect?.value || "openai";

  // 儲存選擇的 AI 模型
  localStorage.setItem("ai_model", aiModel);

  showStatus(`已選擇 OpenAI，API Key 已預設配置`, "success");

  // 顯示工作流程
  document.getElementById("workflow-container").style.display = "block";

  // 延遲隱藏選擇區域
  setTimeout(() => {
    document.getElementById("api-key-section").style.display = "none";
  }, 1500);
}

function showStatus(message, type) {
  const statusDiv = document.getElementById("api-key-status");
  const className = type === "success" ? "status-success" : "status-error";
  statusDiv.innerHTML = `<span class="${className}">${message}</span>`;
}

async function handleBasicInfoSubmit(event) {
  event.preventDefault();

  // 收集基本資訊
  courseData = {
    title: document.getElementById("title").value,
    grade: document.getElementById("grade").value,
    duration: parseInt(document.getElementById("duration").value),
    student_count: parseInt(document.getElementById("student-count").value),
    classroom_equipment: document.getElementById("equipment").value,
  };

  // 處理檔案上傳
  const fileInput = document.getElementById("upload-file");
  let fileContent = null;
  if (fileInput.files.length > 0) {
    try {
      console.log("正在上傳並分析檔案...");
      const uploadedFile = fileInput.files[0];

      // 上傳檔案到後端
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      console.log("檔案上傳成功:", uploadData);

      // 讀取檔案內容
      const contentResponse = await fetch(
        `${API_BASE_URL}/upload/read?file_path=${encodeURIComponent(
          uploadData.file_path
        )}`
      );
      const contentData = await contentResponse.json();
      fileContent = contentData.content;
      console.log("檔案內容已讀取:", fileContent?.substring(0, 200) + "...");

      // 將檔案內容加入課程數據
      courseData.upload_content = fileContent;
    } catch (error) {
      console.error("檔案上傳失敗:", error);
      console.log("將使用基本資訊生成，不包含檔案內容");
    }
  }

  // 顯示載入狀態
  const button = event.target.querySelector('button[type="submit"]');
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "⌛ 生成中...";

  try {
    // 呼叫後端 API 生成教學理念
    await generateRationale();

    // 移動到下一步
    proceedToStep(2);
  } catch (error) {
    console.error("生成失敗:", error);
    alert("生成失敗：" + error.message);
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function generateRationale() {
  try {
    // 獲取 AI 模型選擇
    const aiModel = localStorage.getItem("ai_model") || "openai";

    console.log("選擇的 AI 模型:", aiModel);
    console.log("課程數據:", courseData);

    // 檢查是否有上傳的檔案內容
    if (courseData.upload_content) {
      console.log(
        "✅ 包含上傳的檔案內容，長度:",
        courseData.upload_content.length,
        "字元"
      );
      console.log(
        "檔案內容預覽:",
        courseData.upload_content.substring(0, 300) + "..."
      );
    } else {
      console.log("⚠️ 沒有上傳檔案內容");
    }

    // 準備發送給後端的數據
    const aiSubmodel =
      localStorage.getItem("ai_submodel") || "gpt-4o-mini";

    const requestData = {
      title: courseData.title,
      grade: courseData.grade,
      duration: courseData.duration,
      student_count: courseData.student_count,
      classroom_equipment: courseData.classroom_equipment,
      upload_content: courseData.upload_content || "",
      ai_model: aiModel,
      ai_submodel: aiSubmodel,
      language: currentLanguage, // 添加語言參數
    };

    console.log("📤 發送給後端的完整數據:", requestData);

    // 呼叫後端 API 生成教學理念
    const response = await fetch(`${API_BASE_URL}/courses/generate-rationale`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    console.log("API 響應:", data);

    if (data.status === "success") {
      // 顯示生成的內容
      const rationaleContent = document.getElementById("rationale-content");
      if (rationaleContent) {
        rationaleContent.textContent = data.rationale;
      }
      courseData.rationale = data.rationale;
      courseData.ai_model = aiModel; // 儲存使用的 AI 模型
      console.log("教學理念生成成功");
    } else {
      throw new Error(data.detail || "生成失敗");
    }
  } catch (error) {
    console.error("生成失敗:", error);
    alert(`生成教學理念失敗：${error.message}`);
    // 失敗時使用模擬數據
    const rationale = `**教學理念（模擬資料）**

本課程選擇此主題的原因：
${courseData.title} 是學生理解 ${courseData.grade} 學生需要掌握的核心概念。通過系統性的教學設計，幫助學生建立完整的知識體系。

**學生起點分析**
- 先備知識：${courseData.grade} 學生已具備基礎知識
- 學習經驗：已有相關的學習經驗
- 可能困難：需加強理解抽象概念
- 學習動機：透過實際案例增強學習興趣

**教學價值**
- 知識面：建立完整的理論框架
- 技能面：培養實際應用能力
- 情意面：提升學習興趣和成就感
- 應用面：連結生活實際情境

**跨領域連結**
整合語文、數學、自然等多個領域，培養學生統整思考能力。`;
    document.getElementById("rationale-content").textContent = rationale;
    courseData.rationale = rationale;
  }
}

function initializeSidebar() {
  // 歷史記錄點擊事件
  const historyNavItem = document.getElementById("nav-history");
  if (historyNavItem) {
    historyNavItem.addEventListener("click", () => {
      showHistoryPage();
    });
  }

  // 為每個側邊欄項目添加點擊事件
  for (let i = 1; i <= 7; i++) {
    const navItem = document.getElementById(`nav-step-${i}`);
    if (navItem) {
      navItem.addEventListener("click", () => {
        proceedToStep(i);
      });
    }
  }

  // 設置按鈕
  const toggleSettingsBtn = document.getElementById("toggle-settings");
  if (toggleSettingsBtn) {
    toggleSettingsBtn.addEventListener("click", () => {
      const apiKeySection = document.getElementById("api-key-section");
      if (apiKeySection.style.display === "none") {
        apiKeySection.style.display = "block";
      } else {
        apiKeySection.style.display = "none";
      }
    });
  }
}

function proceedToStep(step) {
  // 隱藏當前步驟
  if (document.getElementById(`step${currentStep}`)) {
    document.getElementById(`step${currentStep}`).style.display = "none";
  }

  // 顯示新步驟
  currentStep = step;
  if (document.getElementById(`step${currentStep}`)) {
    document.getElementById(`step${currentStep}`).style.display = "block";
  }

  // 更新側邊欄高亮
  updateSidebarHighlight();

  // 滾動到頂部
  window.scrollTo(0, 0);
}

function updateSidebarHighlight() {
  // 移除所有活躍狀態
  document.querySelectorAll(".step-item").forEach((item) => {
    item.classList.remove("active");
  });

  // 為當前步驟添加活躍狀態
  const currentNavItem = document.getElementById(`nav-step-${currentStep}`);
  if (currentNavItem) {
    currentNavItem.classList.add("active");

    // 為已完成的步驟添加標記
    for (let i = 1; i < currentStep; i++) {
      const navItem = document.getElementById(`nav-step-${i}`);
      if (navItem) {
        navItem.classList.add("completed");
      }
    }
  }
}

// 佔位函數（待實作）
async function regenerateRationale() {
  console.log("重新生成教學理念");
  await generateRationale();
}

async function generateObjectives() {
  if (courseData.objectives) {
    // 如果已經生成過，直接顯示並模擬短暫延遲以顯示「生成中」狀態
    document.getElementById("objectives-content").textContent =
      courseData.objectives;
    console.log("✅ 學習目標已存在，等待500ms以便顯示生成中狀態...");
    await new Promise((resolve) => setTimeout(resolve, 500));
    return;
  }

  try {
    // 顯示載入狀態
    console.log("📤 開始生成學習目標...");
    document.getElementById("objectives-content").textContent =
      "⌛ 正在生成學習目標...";

    // 獲取 AI 模型選擇
    const aiModel = localStorage.getItem("ai_model") || "openai";

    console.log("生成學習目標，使用模型:", aiModel);

    // 呼叫後端 API 生成學習目標
    const aiSubmodel =
      localStorage.getItem("ai_submodel") || "gpt-4o-mini";
    const response = await fetch(
      `${API_BASE_URL}/courses/generate-objectives`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...courseData,
          ai_model: aiModel,
          ai_submodel: aiSubmodel,
          language: currentLanguage, // 添加語言參數
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log("學習目標 API 響應:", data);

    if (data.status === "success") {
      const objectivesContent = document.getElementById("objectives-content");
      if (objectivesContent) {
        objectivesContent.textContent = data.objectives;
      }
      courseData.objectives = data.objectives;
      console.log("學習目標生成成功");
      console.log(`📊 學習目標內容長度: ${data.objectives?.length || 0} 字元`);
    } else {
      throw new Error(data.detail || "生成失敗");
    }
  } catch (error) {
    console.error("生成學習目標失敗:", error);
    document.getElementById(
      "objectives-content"
    ).textContent = `❌ 生成失敗：${error.message}`;
  }
}

async function regenerateObjectives() {
  console.log("重新生成學習目標");
  courseData.objectives = null; // 清除舊的學習目標
  await generateObjectives();
}

async function generateStrategies() {
  if (courseData.strategies) {
    document.getElementById("strategies-content").textContent =
      courseData.strategies;
    console.log("✅ 教學策略已存在，等待500ms以便顯示生成中狀態...");
    await new Promise((resolve) => setTimeout(resolve, 500));
    return;
  }

  try {
    console.log("📤 開始生成教學策略...");
    document.getElementById("strategies-content").textContent =
      "⌛ 正在生成教學策略...";
    const aiModel = localStorage.getItem("ai_model") || "openai";

    const aiSubmodel =
      localStorage.getItem("ai_submodel") || "gpt-4o-mini";
    const response = await fetch(
      `${API_BASE_URL}/courses/generate-strategies`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...courseData,
          ai_model: aiModel,
          ai_submodel: aiSubmodel,
          language: currentLanguage, // 添加語言參數
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status === "success") {
      document.getElementById("strategies-content").textContent =
        data.strategies;
      courseData.strategies = data.strategies;
      console.log(`📊 教學策略內容長度: ${data.strategies?.length || 0} 字元`);
    } else {
      throw new Error(data.detail || "生成失敗");
    }
  } catch (error) {
    console.error("生成教學策略失敗:", error);
    document.getElementById(
      "strategies-content"
    ).textContent = `❌ 生成失敗：${error.message}`;
  }
}

async function regenerateStrategies() {
  courseData.strategies = null;
  await generateStrategies();
}

async function generateFlow() {
  if (courseData.teaching_flow) {
    document.getElementById("flow-content").textContent =
      courseData.teaching_flow;
    console.log("✅ 教學流程已存在，等待500ms以便顯示生成中狀態...");
    await new Promise((resolve) => setTimeout(resolve, 500));
    return;
  }

  try {
    console.log("📤 開始生成教學流程...");
    document.getElementById("flow-content").textContent =
      "⌛ 正在生成教學流程...";
    const aiModel = localStorage.getItem("ai_model") || "openai";

    const aiSubmodel =
      localStorage.getItem("ai_submodel") || "gpt-4o-mini";
    const response = await fetch(`${API_BASE_URL}/courses/generate-flow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...courseData,
        ai_model: aiModel,
        ai_submodel: aiSubmodel,
        language: currentLanguage, // 添加語言參數
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status === "success") {
      document.getElementById("flow-content").textContent = data.flow;
      courseData.teaching_flow = data.flow;
      console.log(`📊 教學流程內容長度: ${data.flow?.length || 0} 字元`);
    } else {
      throw new Error(data.detail || "生成失敗");
    }
  } catch (error) {
    console.error("生成教學流程失敗:", error);
    document.getElementById(
      "flow-content"
    ).textContent = `❌ 生成失敗：${error.message}`;
  }
}

async function regenerateFlow() {
  console.log("重新生成教學流程");
}

function toggleGammaSettings() {
  const settingsPanel = document.getElementById("gamma-settings-panel");
  const toggleBtn = document.getElementById("toggle-gamma-settings");
  const t = translations[currentLanguage];

  if (settingsPanel.style.display === "none") {
    settingsPanel.style.display = "block";
    toggleBtn.textContent = `❌ ${t.closeSettings}`;
    toggleBtn.classList.add("btn-active");
  } else {
    settingsPanel.style.display = "none";
    toggleBtn.textContent = `⚙️ ${t.gammaSettings}`;
    toggleBtn.classList.remove("btn-active");
  }
}

async function generateMaterials() {
  console.log("製作簡報 - 使用 Gamma API");

  // 收集 Gamma 設定
  const gammaSettings = {
    language: document.getElementById("gamma-language").value,
    num_cards: parseInt(document.getElementById("gamma-num-cards").value),
    text_amount: document.getElementById("gamma-text-amount").value,
    tone: document.getElementById("gamma-tone").value,
    audience: document.getElementById("gamma-audience").value,
    image_model: document.getElementById("gamma-image-model").value,
    image_style: document.getElementById("gamma-image-style").value,
  };

  console.log("Gamma 設定:", gammaSettings);

  // 顯示載入狀態（Gamma 生成時間較長）
  showStatus("正在生成 PPT，請稍候...", "info");

  try {
    // 準備請求數據
    const requestData = {
      title: courseData.title,
      language: gammaSettings.language,
      num_cards: gammaSettings.num_cards,
      basic_info: {
        grade: courseData.grade,
        duration: courseData.duration,
        student_count: courseData.student_count,
        classroom_equipment: courseData.classroom_equipment,
      },
      rationale: courseData.rationale || "",
      objectives: courseData.objectives || "",
      strategies: courseData.strategies || "",
      teaching_flow: courseData.teaching_flow || "",
      // 添加額外的 Gamma 設定
      text_amount: gammaSettings.text_amount,
      tone: gammaSettings.tone,
      audience: gammaSettings.audience,
      image_model: gammaSettings.image_model,
      image_style: gammaSettings.image_style,
    };

    console.log("📤 發送 Gamma API 請求:", requestData);

    // 調用 Gamma API
    const response = await fetch(`${API_BASE_URL}/courses/generate-ppt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    console.log("📥 Gamma API 回應:", data);

    if (data.status === "success") {
      showStatus(
        `✅ PPT 生成請求已提交！\nGeneration ID: ${data.generation_id}\n狀態: ${data.status_info}`,
        "success"
      );

      // 儲存 generation_id 以便後續查詢
      courseData.gamma_generation_id = data.generation_id;

      // 自動檢查狀態
      checkGammaStatus(data.generation_id);
    } else {
      throw new Error(data.detail || "生成失敗");
    }
  } catch (error) {
    console.error("生成 PPT 失敗:", error);
    showStatus(`❌ 生成失敗：${error.message}`, "error");
  }
}

// 檢查 Gamma 生成狀態
async function checkGammaStatus(generationId) {
  console.log(`檢查 Gamma 狀態: ${generationId}`);

  // 每 5 秒檢查一次，最多等待 2 分鐘
  let attempts = 0;
  const maxAttempts = 24;

  const checkStatus = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/courses/gamma-status/${generationId}`
      );
      const data = await response.json();

      console.log(`狀態檢查 ${attempts + 1}/${maxAttempts}:`, data);

      if (data.status === "success") {
        if (data.generation_status === "completed") {
          // 生成完成
          showStatus(
            `🎉 PPT 生成完成！\n${
              data.gamma_url ? `URL: ${data.gamma_url}` : ""
            }`,
            "success"
          );

          // 儲存 Gamma URL 到 localStorage
          if (data.gamma_url) {
            localStorage.setItem("gammaUrl", data.gamma_url);
          }

          // 顯示結果並確保按鈕可見
          showMaterialResult(data.gamma_url);

          // 跳轉到步驟6
          proceedToStep(6);
          return true;
        } else if (data.generation_status === "pending") {
          // 仍在生成中
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 5000);
          } else {
            showStatus("⏰ 生成時間較長，請稍後手動檢查狀態", "info");
          }
        }
      }
    } catch (error) {
      console.error("檢查狀態失敗:", error);
      showStatus("❌ 檢查狀態失敗", "error");
    }
  };

  await checkStatus();
}

// 顯示材料結果
function showMaterialResult(gammaUrl) {
  const materialsContent = document.getElementById("materials-content");
  if (materialsContent) {
    materialsContent.innerHTML = `
      <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e0e0e0;">
        <h3 style="color: #4a90e2; margin-bottom: 15px;">✅ PPT 生成完成</h3>
        ${
          gammaUrl
            ? `<p><a href="${gammaUrl}" target="_blank" style="color: #4a90e2; text-decoration: underline;">點擊查看簡報</a></p>`
            : ""
        }
        <p style="color: #333; margin-top: 10px;">
          您可以在 Gamma.app 上查看、編輯並分享您的簡報。
        </p>
      </div>
    `;

    // 顯示「下一步：製作學習單」按鈕
    const generateWorksheetsBtn = document.getElementById(
      "generate-worksheets"
    );
    if (generateWorksheetsBtn) {
      generateWorksheetsBtn.style.display = "inline-block";
    }
  }
}

// 顯示狀態訊息
function showStatus(message, type) {
  const materialsContent = document.getElementById("materials-content");
  if (materialsContent) {
    const className =
      type === "success"
        ? "status-success"
        : type === "error"
        ? "status-error"
        : "status-info";
    materialsContent.innerHTML = `<div class="${className}" style="padding: 15px; margin: 10px 0;">${message}</div>`;
  }
}

async function downloadAll() {
  console.log("下載所有材料");
  alert("下載功能待實作");
}

// 設定按鈕生成中狀態
function setGeneratingState(buttonId, isGenerating, text) {
  const button = document.getElementById(buttonId);
  if (!button) {
    console.error(`❌ 找不到按鈕: ${buttonId}`);
    return;
  }

  console.log(`🔄 setGeneratingState(${buttonId}, ${isGenerating}, "${text}")`);

  if (isGenerating) {
    button.disabled = true;
    button.textContent = text || "生成中...";
    button.style.opacity = "0.6";
    button.style.cursor = "not-allowed";
    console.log(`✅ 按鈕 ${buttonId} 已設為生成中狀態`);
  } else {
    button.disabled = false;
    button.textContent = text;
    button.style.opacity = "1";
    button.style.cursor = "pointer";
    console.log(`✅ 按鈕 ${buttonId} 已恢復正常狀態`);
  }
}

async function generateWorksheets() {
  const worksheetContent = document.getElementById("worksheet-content");

  // 如果已有內容，直接顯示並返回（不調用 API）
  if (courseData.worksheet) {
    worksheetContent.innerHTML = renderMarkdown(courseData.worksheet);
    return;
  }

  // 清除舊內容並顯示載入訊息
  worksheetContent.textContent = "⌛ 正在生成學習單...";
  worksheetContent.style.color = "#4a90e2";
  worksheetContent.style.fontWeight = "bold";
  worksheetContent.style.fontSize = "1.2em";
  worksheetContent.style.textAlign = "center";
  worksheetContent.style.padding = "20px";
  worksheetContent.style.backgroundColor = "#e6f7ff";
  worksheetContent.style.borderRadius = "8px";

  // 重置樣式的輔助函數
  const resetStyles = () => {
    worksheetContent.style.color = "";
    worksheetContent.style.fontWeight = "";
    worksheetContent.style.fontSize = "";
    worksheetContent.style.textAlign = "";
    worksheetContent.style.padding = "";
    worksheetContent.style.backgroundColor = "";
    worksheetContent.style.borderRadius = "";
  };

  try {
    const aiModel = localStorage.getItem("ai_model") || "openai";
    const aiSubmodel =
      localStorage.getItem("ai_submodel") || "gpt-4o-mini";

    // 準備請求資料
    const requestData = {
      title: courseData.title || courseData.basic_info?.title,
      grade: courseData.grade || courseData.basic_info?.grade,
      duration: courseData.duration || courseData.basic_info?.duration,
      student_count:
        courseData.student_count || courseData.basic_info?.student_count,
      rationale: courseData.rationale,
      objectives: courseData.objectives,
      teaching_flow: courseData.teaching_flow,
      ai_model: aiModel,
      ai_submodel: aiSubmodel,
      language: currentLanguage, // 添加語言參數
    };

    // 前端驗證：檢查必要資料
    if (
      !requestData.title ||
      !requestData.rationale ||
      !requestData.objectives ||
      !requestData.teaching_flow
    ) {
      throw new Error("生成學習單所需的基本資訊不完整。請完成所有前置步驟。");
    }

    console.log("📤 發送學習單生成請求...", requestData);

    const response = await fetch(`${API_BASE_URL}/courses/generate-worksheet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...courseData,
        ai_model: aiModel,
        ai_submodel: aiSubmodel,
        language: currentLanguage,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("📥 收到學習單 API 響應:", data);

    if (data.status === "success") {
      worksheetContent.innerHTML = renderMarkdown(data.worksheet);
      courseData.worksheet = data.worksheet;
      console.log(`📊 學習單內容長度: ${data.worksheet?.length || 0} 字元`);
      resetStyles();

      // 學習單生成完成後自動保存課程計劃
      console.log("💾 學習單已完成，自動保存課程計劃...");
      await saveCoursePlan();
    } else {
      throw new Error(data.detail || "生成失敗");
    }
  } catch (error) {
    console.error("生成學習單失敗:", error);
    worksheetContent.textContent = `❌ 生成失敗：${error.message}`;
    worksheetContent.style.color = "#d32f2f";
    worksheetContent.style.fontWeight = "bold";
    worksheetContent.style.fontSize = "1.2em";
    worksheetContent.style.textAlign = "center";
    worksheetContent.style.padding = "20px";
    worksheetContent.style.backgroundColor = "#ffebee";
    worksheetContent.style.borderRadius = "8px";
  }
}

async function regenerateWorksheet() {
  console.log("重新生成學習單");
  courseData.worksheet = null;
  await generateWorksheets();
}

async function downloadWorksheet() {
  console.log("下載學習單");

  const worksheetContent =
    document.getElementById("worksheet-content").textContent;

  if (!worksheetContent || !worksheetContent.trim()) {
    alert("請先生成學習單內容");
    return;
  }

  // 轉換內容為 HTML 格式
  const htmlContent = convertWorksheetToHTML(worksheetContent);

  // 創建下載連結
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `學習單_${courseData.title || "課程"}_${
    new Date().toISOString().split("T")[0]
  }.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  alert("學習單已下載！您可以用瀏覽器打開文件進行列印。");
}

function convertWorksheetToHTML(content) {
  // 按大標題分割內容，每個大單元一頁
  const sections = content.split(
    /(?=^[一-九]、|^[一二三四五六七八九十]+、|^一、|^二、|^三、|^四、|^五、|^六、)/m
  );

  let pagesHTML = "";

  sections.forEach((section, index) => {
    if (!section.trim()) return;

    // 轉換每個段落
    let html = section
      // 大標題
      .replace(/^([一-九]、.+)$/gm, "<h1>$1</h1>")
      .replace(/^([一二三四五六七八九十]+、.+)$/gm, "<h1>$1</h1>")
      // 小標題
      .replace(
        /^（(.+?)）$/gm,
        "<h4 style='color: #666; font-weight: normal;'>（$1）</h4>"
      )
      // 加粗文字
      .replace(/\*\*(.+?)\*\*/g, "<strong style='color: #2c3e50;'>$1</strong>")
      // 列表項目
      .replace(
        /^(\d+)[.．] (.+)$/gm,
        '<p style="margin-left: 25px; margin-bottom: 6px; line-height: 1.8;">$1. $2</p>'
      )
      .replace(
        /^[-－] (.+)$/gm,
        '<p style="margin-left: 25px; margin-bottom: 6px; line-height: 1.8;">• $1</p>'
      )
      // 冒號後面特殊標註
      .replace(
        /：(.+)/g,
        "：<span style='color: #4a90e2; font-weight: bold;'>$1</span>"
      );

    // 普通段落
    const lines = html.split("\n");
    let processedLines = [];

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // 如果不是 HTML 標籤，視為普通段落
      if (!trimmedLine.startsWith("<") && trimmedLine.length > 0) {
        processedLines.push(
          `<p style="margin: 8px 0; line-height: 1.8; text-align: justify;">${trimmedLine}</p>`
        );
      } else {
        processedLines.push(line);
      }
    });

    html = processedLines.join("\n");

    // 每頁包裝
    pagesHTML += `
      <div class="page-break"></div>
      <div class="page-content">
        ${html}
      </div>
    `;
  });

  // 創建完整的 HTML 結構
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${courseData.title || "學習單"}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 2cm 1.5cm;
      }
      .page-break {
        page-break-before: always;
        page-break-after: always;
        page-break-inside: avoid;
      }
      .page-content {
        page-break-after: always;
      }
      .no-print {
        display: none;
      }
    }
    
    body {
      font-family: 'Microsoft JhengHei', 'PingFang TC', Arial, sans-serif;
      line-height: 1.8;
      color: #333;
      background: white;
      padding: 0;
      margin: 0;
    }
    
    .no-print {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
    }
    
    .btn-print {
      background: #52AA5E;
      color: white;
      border: 2px solid #4285F4;
      padding: 12px 24px;
      font-size: 16px;
      cursor: pointer;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    
    .btn-print:hover {
      background: #449554;
    }
    
    .page-break {
      margin: 0;
      padding: 0;
    }
    
    .page-content {
      min-height: 24.5cm;
      max-height: 24.5cm;
      padding: 30px 25px;
      box-sizing: border-box;
      overflow: hidden;
    }
    
    h1 {
      font-size: 22px;
      color: #4a90e2;
      border-left: 5px solid #4a90e2;
      padding-left: 15px;
      margin: 15px 0;
      font-weight: bold;
    }
    
    h2 {
      font-size: 18px;
      color: #666;
      margin: 12px 0 8px 0;
      font-weight: bold;
    }
    
    h3 {
      font-size: 16px;
      color: #888;
      margin: 10px 0 6px 0;
      font-weight: 600;
    }
    
    h4 {
      font-size: 14px;
      color: #999;
      margin: 8px 0 4px 0;
    }
    
    p {
      margin: 6px 0;
      line-height: 1.8;
      text-align: justify;
    }
    
    strong {
      color: #2c3e50;
      font-weight: bold;
    }
    
    @page {
      size: A4;
      margin: 2cm 1.5cm;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn-print" onclick="window.print()">🖨️ 列印學習單</button>
  </div>
  
  ${pagesHTML}
</body>
</html>`;
}

// 編輯內容功能
function editContent(type) {
  const contentElement = document.getElementById(`${type}-content`);
  if (!contentElement) {
    alert("找不到內容元素");
    return;
  }

  const currentContent = contentElement.textContent;

  // 創建編輯彈窗
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;

  modal.innerHTML = `
    <div style="
      background: white;
      padding: 30px;
      border-radius: 10px;
      width: 90%;
      max-width: 1200px;
      height: 85vh;
      max-height: 85vh;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
    ">
      <h2 style="margin-top: 0; margin-bottom: 15px;">編輯內容</h2>
      <textarea id="edit-textarea" style="
        width: 100%;
        height: calc(85vh - 150px);
        min-height: 500px;
        padding: 15px;
        border: 2px solid #ddd;
        border-radius: 5px;
        font-family: monospace;
        font-size: 15px;
        resize: vertical;
        overflow-y: auto;
        flex: 1;
      ">${currentContent}</textarea>
      <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end;">
        <button id="cancel-edit" class="btn btn-secondary">取消</button>
        <button id="save-edit" class="btn btn-primary">儲存</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // 取消按鈕
  modal.querySelector("#cancel-edit").addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  // 儲存按鈕
  modal.querySelector("#save-edit").addEventListener("click", () => {
    const newContent = modal.querySelector("#edit-textarea").value;
    contentElement.textContent = newContent;

    // 更新 courseData
    const keys = {
      rationale: "rationale",
      objectives: "objectives",
      strategies: "strategies",
      flow: "teaching_flow",
      worksheet: "worksheet",
    };

    if (keys[type]) {
      courseData[keys[type]] = newContent;
    }

    document.body.removeChild(modal);
    alert("內容已更新！");
  });

  // ESC 鍵關閉
  const escapeHandler = (e) => {
    if (e.key === "Escape") {
      document.body.removeChild(modal);
      document.removeEventListener("keydown", escapeHandler);
    }
  };
  document.addEventListener("keydown", escapeHandler);

  // 點擊背景關閉
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
      document.removeEventListener("keydown", escapeHandler);
    }
  });
}

function initializePromptEditor() {
  // Prompt 編輯器切換按鈕
  const togglePromptEditor = document.getElementById("toggle-prompt-editor");
  const closePromptEditor = document.getElementById("close-prompt-editor");
  const promptEditor = document.getElementById("prompt-editor");
  const promptStepSelect = document.getElementById("prompt-step-select");
  const savePromptBtn = document.getElementById("save-prompt");
  const resetPromptBtn = document.getElementById("reset-prompt");

  if (togglePromptEditor) {
    togglePromptEditor.addEventListener("click", () => {
      promptEditor.style.display =
        promptEditor.style.display === "none" ? "block" : "none";
      if (promptEditor.style.display === "block") {
        loadPromptForStep(parseInt(promptStepSelect.value));
      }
    });
  }

  if (closePromptEditor) {
    closePromptEditor.addEventListener("click", () => {
      promptEditor.style.display = "none";
    });
  }

  if (promptStepSelect) {
    promptStepSelect.addEventListener("change", (e) => {
      loadPromptForStep(parseInt(e.target.value));
    });
  }

  if (savePromptBtn) {
    savePromptBtn.addEventListener("click", savePrompt);
  }

  if (resetPromptBtn) {
    resetPromptBtn.addEventListener("click", resetPrompt);
  }
}

async function loadPromptForStep(stepNumber) {
  try {
    const response = await fetch(`${API_BASE_URL}/prompts/${stepNumber}`);
    const prompt = await response.json();

    document.getElementById("prompt-name").textContent = prompt.name;
    document.getElementById("prompt-variables").textContent =
      prompt.variables.join(", ");
    document.getElementById("prompt-content").value = prompt.content;

    // 儲存當前編輯的步驟
    document.getElementById("prompt-content").dataset.step = stepNumber;
  } catch (error) {
    console.error("載入 Prompt 失敗:", error);
    alert("載入 Prompt 失敗，請重試");
  }
}

async function savePrompt() {
  const stepNumber = document.getElementById("prompt-content").dataset.step;
  const content = document.getElementById("prompt-content").value;

  try {
    const response = await fetch(`${API_BASE_URL}/prompts/${stepNumber}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: content,
      }),
    });

    const result = await response.json();

    if (result.status === "success") {
      document.getElementById("prompt-status").innerHTML =
        '<span class="status-success">✅ Prompt 已成功儲存</span>';
    }
  } catch (error) {
    console.error("儲存 Prompt 失敗:", error);
    document.getElementById("prompt-status").innerHTML =
      '<span class="status-error">❌ 儲存失敗，請重試</span>';
  }
}

// 語言切換功能
function toggleLanguage() {
  currentLanguage = currentLanguage === "zh" ? "en" : "zh";
  localStorage.setItem("language", currentLanguage);
  applyLanguage(currentLanguage);
}

function applyLanguage(lang) {
  const t = translations[lang];

  // 更新語言切換按鈕
  const currentLangText = document.getElementById("current-lang-text");
  const switchToText = document.getElementById("switch-to-text");
  if (currentLangText) {
    currentLangText.textContent = t.currentLang;
  }
  if (switchToText) {
    switchToText.textContent = " / " + t.switchTo;
  }

  // 更新標題
  const titleElement = document.querySelector(".sidebar-header h1");
  if (titleElement) {
    titleElement.textContent = `📚 ${t.title}`;
  }

  // 更新副標題
  const subtitleElement = document.querySelector(".subtitle");
  if (subtitleElement) {
    subtitleElement.textContent = t.subtitle;
  }

  // 更新側邊欄標籤
  const aiModelLabels = document.querySelectorAll("h3");
  if (aiModelLabels[0]) aiModelLabels[0].textContent = `🤖 ${t.aiModel}`;
  if (aiModelLabels[1]) aiModelLabels[1].textContent = `📡 ${t.subModel}`;

  // 更新 Prompt 編輯按鈕
  const promptEditBtn = document.getElementById("toggle-prompt-editor");
  if (promptEditBtn) {
    promptEditBtn.textContent = `📝 ${t.promptEdit}`;
  }

  // 更新歷史記錄標籤
  const historyLabel = document.querySelector("#nav-history .step-label");
  if (historyLabel) {
    historyLabel.textContent = lang === "zh" ? "歷史記錄" : "History";
  }

  // 更新步驟標籤
  document.querySelector("#nav-step-1 .step-label").textContent = t.step1;
  document.querySelector("#nav-step-2 .step-label").textContent = t.step2;
  document.querySelector("#nav-step-3 .step-label").textContent = t.step3;
  document.querySelector("#nav-step-4 .step-label").textContent = t.step4;
  document.querySelector("#nav-step-5 .step-label").textContent = t.step5;
  document.querySelector("#nav-step-6 .step-label").textContent = t.step6;
  document.querySelector("#nav-step-7 .step-label").textContent = t.step7;

  // 更新步驟標題
  const step1H2 = document.querySelector("#step1 h2");
  const step2H2 = document.querySelector("#step2 h2");
  const step3H2 = document.querySelector("#step3 h2");
  const step4H2 = document.querySelector("#step4 h2");
  const step5H2 = document.querySelector("#step5 h2");
  const step6H2 = document.querySelector("#step6 h2");
  const step7H2 = document.querySelector("#step7 h2");

  if (step1H2) step1H2.textContent = t.step1Title;
  if (step2H2) step2H2.textContent = t.step2Title;
  if (step3H2) step3H2.textContent = t.step3Title;
  if (step4H2) step4H2.textContent = t.step4Title;
  if (step5H2) step5H2.textContent = t.step5Title;
  if (step6H2) step6H2.textContent = t.step6Title;
  if (step7H2) step7H2.textContent = t.step7Title;

  // 更新按鈕文字
  const buttonsToUpdate = [
    { id: "edit-rationale", text: t.edit },
    { id: "regenerate-rationale", text: t.regenerate },
    { id: "confirm-rationale", text: t.nextObjectives },
    { id: "edit-objectives", text: t.edit },
    { id: "regenerate-objectives", text: t.regenerate },
    { id: "confirm-objectives", text: t.nextStrategies },
    { id: "edit-strategies", text: t.edit },
    { id: "regenerate-strategies", text: t.regenerate },
    { id: "confirm-strategies", text: t.nextFlow },
    { id: "edit-flow", text: t.edit },
    { id: "regenerate-flow", text: t.regenerate },
    { id: "generate-worksheets", text: t.nextStep + t.generateWorksheet },
    { id: "edit-worksheet", text: t.edit },
    { id: "regenerate-worksheet", text: t.regenerate },
    { id: "download-worksheet", text: t.download },
    { id: "generate-materials", text: t.generateMaterials },
    { id: "toggle-gamma-settings", text: `⚙️ ${t.gammaSettings}` },
    { id: "start-using", text: `✅ ${t.start}` },
  ];

  buttonsToUpdate.forEach(({ id, text }) => {
    const btn = document.getElementById(id);
    if (btn && text) {
      btn.textContent = text;
    }
  });

  // 更新歡迎標題
  const welcomeTitle = document.querySelector("#api-key-section h2");
  if (welcomeTitle) {
    welcomeTitle.textContent = `👋 ${t.welcome}`;
  }

  // 更新功能特色
  const featuresTitle = document.querySelector("#api-key-section h3");
  if (featuresTitle) {
    featuresTitle.textContent = `✨ ${t.features}`;
  }

  // 更新第一步驟表單
  updateStep1Form(lang);

  // 更新檔案上傳按鈕
  updateFileUploadLabel(lang);
}

function updateFileUploadLabel(lang) {
  const t = translations[lang];
  const fileInput = document.getElementById("upload-file");

  if (!fileInput) return;

  // 瀏覽器的原生檔案選擇按鈕文字無法直接翻譯
  // 但我們可以通過 CSS 隱藏原生按鈕，使用自訂樣式
  // 這裡需要實現一個自訂的檔案上傳按鈕

  // 創建或獲取自訂按鈕容器
  let customUploadContainer = fileInput.parentElement.querySelector(
    ".custom-file-upload"
  );

  if (!customUploadContainer) {
    // 如果還不存在，創建自訂容器
    customUploadContainer = document.createElement("div");
    customUploadContainer.className = "custom-file-upload";
    customUploadContainer.style.cssText =
      "position: relative; display: inline-block;";

    // 創建自訂按鈕
    const customButton = document.createElement("button");
    customButton.type = "button";
    customButton.className = "custom-file-button";
    customButton.textContent = t.chooseFile;

    // 創建顯示檔案名的元素
    const fileNameDisplay = document.createElement("span");
    fileNameDisplay.className = "file-name-display";
    fileNameDisplay.textContent = t.noFileChosen;

    customUploadContainer.appendChild(customButton);
    customUploadContainer.appendChild(fileNameDisplay);

    // 隱藏原生檔案輸入框
    fileInput.style.position = "absolute";
    fileInput.style.opacity = "0";
    fileInput.style.width = "100%";
    fileInput.style.height = "100%";
    fileInput.style.cursor = "pointer";

    // 將自訂容器插入到原生輸入框之後
    fileInput.parentElement.insertBefore(customUploadContainer, fileInput);

    // 綁定點擊事件
    customButton.addEventListener("click", function () {
      fileInput.click();
    });

    // 監聽檔案選擇變化
    fileInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        fileNameDisplay.textContent = file.name;
      } else {
        fileNameDisplay.textContent = t.noFileChosen;
      }
    });
  } else {
    // 更新現有自訂按鈕的文字
    const customButton = customUploadContainer.querySelector(
      ".custom-file-button"
    );
    const fileNameDisplay =
      customUploadContainer.querySelector(".file-name-display");

    if (customButton) {
      customButton.textContent = t.chooseFile;
    }

    // 如果沒有選中檔案，更新顯示文字
    if (fileInput.files.length === 0 && fileNameDisplay) {
      fileNameDisplay.textContent = t.noFileChosen;
    }
  }
}

function updateStep1Form(lang) {
  const t = translations[lang];

  // 更新標籤
  const labels = document.querySelectorAll("#step1 label");
  if (labels[0]) labels[0].textContent = `${t.courseTitle} *`;
  if (labels[1]) labels[1].textContent = `${t.grade} *`;
  if (labels[2]) labels[2].textContent = `${t.courseDuration} *`;
  if (labels[3]) labels[3].textContent = `${t.studentCount} *`;
  if (labels[4]) labels[4].textContent = t.classroomEquipment;
  if (labels[5]) labels[5].textContent = t.lessonPlanContent;

  // 更新選擇框
  const gradeSelect = document.getElementById("grade");
  if (gradeSelect) {
    // 更新「請選擇」文字
    if (gradeSelect.options[0]) {
      gradeSelect.options[0].textContent = t.pleaseSelect;
    }

    // 更新 optgroup 標籤
    const optgroups = gradeSelect.querySelectorAll("optgroup");
    console.log(`🔍 找到 ${optgroups.length} 個 optgroup`);

    if (optgroups.length >= 4) {
      if (lang === "en") {
        optgroups[0].label = "Kindergarten";
        optgroups[1].label = "Elementary School";
        optgroups[2].label = "Junior High School";
        optgroups[3].label = "Senior High School";
      } else {
        optgroups[0].label = "幼兒園";
        optgroups[1].label = "國小";
        optgroups[2].label = "國中";
        optgroups[3].label = "高中";
      }
    }

    // 更新選項文字 - 遍歷所有 optgroup 中的選項
    const gradeOptions = t.gradeOptions.split(",");
    console.log(`📋 gradeOptions 數量: ${gradeOptions.length}`);
    console.log(`📋 內容: ${gradeOptions.join(", ")}`);

    let optionIndex = 0;

    // 遍歷所有選項（包括 optgroup 中的）
    for (let i = 0; i < gradeSelect.options.length; i++) {
      const option = gradeSelect.options[i];
      // 跳過「請選擇」選項
      if (option.value === "" || option.value === "請選擇") {
        continue;
      }

      // 更新選項文字
      if (optionIndex < gradeOptions.length) {
        option.textContent = gradeOptions[optionIndex];
        console.log(
          `✅ 更新選項 ${i}: ${option.value} → ${gradeOptions[optionIndex]}`
        );
        optionIndex++;
      }
    }

    console.log(`✨ 共更新了 ${optionIndex} 個選項`);
  }

  // 更新佔位文字
  const equipmentInput = document.getElementById("equipment");
  if (equipmentInput) {
    equipmentInput.placeholder = t.equipmentPlaceholder;
  }

  // 更新檔案說明
  const fileInstructions = document.querySelector("#upload-file + small");
  if (fileInstructions) {
    fileInstructions.textContent = t.supportedFormats;
  }

  // 更新提交按鈕
  const submitBtn = document.querySelector(
    '#basic-info-form button[type="submit"]'
  );
  if (submitBtn) {
    submitBtn.textContent = t.nextRationale;
  }

  // 更新歡迎訊息
  const welcomeText = document.querySelector("#api-key-section p");
  if (welcomeText) {
    if (lang === "en") {
      welcomeText.textContent =
        "Please select an AI model on the left sidebar and then start creating your course plan!";
    } else {
      welcomeText.textContent =
        "請在左側選擇 AI 模型，然後開始創建您的課程計劃！";
    }
  }

  // 更新功能特色
  const featuresList = document.querySelectorAll("#api-key-section ul li");
  if (featuresList && featuresList.length > 0) {
    if (lang === "en") {
      featuresList[0].textContent =
        "🚀 Using the latest OpenAI models (GPT-4o series)";
      featuresList[1].textContent =
        "📝 Generate complete lesson plans in 7 steps";
      featuresList[2].textContent = "🎨 Beautiful sidebar navigation";
      featuresList[3].textContent = "🔧 Customizable Prompt templates";
      featuresList[4].textContent = "💾 Auto-save progress";
    } else {
      featuresList[0].textContent =
        "🚀 使用最新的 OpenAI 模型（GPT-4o 系列）";
      featuresList[1].textContent = "📝 七步驟生成完整課程計劃";
      featuresList[2].textContent = "🎨 美觀的側邊欄導航";
      featuresList[3].textContent = "🔧 可自訂 Prompt 模板";
      featuresList[4].textContent = "💾 自動儲存進度";
    }
  }
}

async function resetPrompt() {
  const stepNumber = document.getElementById("prompt-content").dataset.step;

  if (!confirm("確定要重置為預設 Prompt 嗎？")) {
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/prompts/${stepNumber}/reset`,
      {
        method: "POST",
      }
    );

    const result = await response.json();

    if (result.status === "success") {
      document.getElementById("prompt-status").innerHTML =
        '<span class="status-success">✅ Prompt 已重置為預設值</span>';
      loadPromptForStep(parseInt(stepNumber));
    }
  } catch (error) {
    console.error("重置 Prompt 失敗:", error);
    document.getElementById("prompt-status").innerHTML =
      '<span class="status-error">❌ 重置失敗，請重試</span>';
  }
}

function togglePromptSettings() {
  console.log("切換 Prompt 設定");
  const promptEditor = document.getElementById("prompt-editor");
  promptEditor.style.display =
    promptEditor.style.display === "none" ? "block" : "none";
  if (promptEditor.style.display === "block") {
    loadPromptForStep(1);
  }
}

// ==================== 歷史記錄功能 ====================

// 顯示歷史記錄頁面
async function showHistoryPage() {
  // 隱藏所有步驟
  document.querySelectorAll("section[id^='step']").forEach((section) => {
    section.style.display = "none";
  });

  // 隱藏歡迎資訊
  const apiKeySection = document.getElementById("api-key-section");
  if (apiKeySection) {
    apiKeySection.style.display = "none";
  }

  // 顯示歷史記錄頁面
  const historyPage = document.getElementById("history-page");
  const planDetailPage = document.getElementById("plan-detail-page");
  if (historyPage) historyPage.style.display = "block";
  if (planDetailPage) planDetailPage.style.display = "none";

  // 更新側邊欄高亮
  document.querySelectorAll(".step-item").forEach((item) => {
    item.classList.remove("active");
  });
  const historyNav = document.getElementById("nav-history");
  if (historyNav) historyNav.classList.add("active");

  // 載入歷史記錄列表
  await loadHistoryList();
}

// 載入歷史記錄列表
async function loadHistoryList() {
  try {
    const response = await fetch(`${API_BASE_URL}/course-plans`);
    const data = await response.json();

    const historyList = document.getElementById("history-list");
    const currentLang = localStorage.getItem("currentLanguage") || "zh";

    if (!data.course_plans || data.course_plans.length === 0) {
      historyList.innerHTML = `<p style="text-align: center; color: #666; padding: 40px;">
        ${currentLang === "zh" ? "目前尚無課程計劃記錄" : "No course plans yet"}
      </p>`;
      return;
    }

    let html = '<div class="history-grid">';
    data.course_plans.forEach((plan) => {
      const date = plan.created_at
        ? new Date(plan.created_at).toLocaleString(
            currentLang === "zh" ? "zh-TW" : "en-US"
          )
        : "";
      html += `
        <div class="history-item" onclick="viewPlanDetail(${plan.id})">
          <h3>${plan.title || "無標題"}</h3>
          <div class="history-meta">
            <span>${currentLang === "zh" ? "年級" : "Grade"}: ${
        plan.grade || "-"
      }</span>
            <span>${currentLang === "zh" ? "時長" : "Duration"}: ${
        plan.duration || "-"
      } ${currentLang === "zh" ? "分鐘" : "mins"}</span>
          </div>
          <div class="history-date">${date}</div>
        </div>
      `;
    });
    html += "</div>";
    historyList.innerHTML = html;
  } catch (error) {
    console.error("載入歷史記錄失敗:", error);
    const currentLang = localStorage.getItem("currentLanguage") || "zh";
    document.getElementById("history-list").innerHTML = `
      <p style="text-align: center; color: #d32f2f; padding: 40px;">
        ${currentLang === "zh" ? "載入失敗，請重試" : "Failed to load history"}
      </p>
    `;
  }
}

// 查看課程計劃詳情
async function viewPlanDetail(planId) {
  try {
    const response = await fetch(`${API_BASE_URL}/course-plans/${planId}`);
    const data = await response.json();

    const plan = data.course_plan;
    const currentLang = localStorage.getItem("currentLanguage") || "zh";

    // 顯示詳情頁面
    const historyPage = document.getElementById("history-page");
    const planDetailPage = document.getElementById("plan-detail-page");
    const detailTitle = document.getElementById("detail-title");
    const detailContent = document.getElementById("detail-content");

    if (historyPage) historyPage.style.display = "none";
    if (planDetailPage) planDetailPage.style.display = "block";
    if (detailTitle) detailTitle.textContent = plan.title || "課程計劃詳情";

    if (detailContent) {
      const lang = plan.language === "en" ? "en" : "zh";
      let html = `
        <div class="plan-detail-section">
          <h3>${lang === "zh" ? "基本資訊" : "Basic Information"}</h3>
          <p><strong>${lang === "zh" ? "年級" : "Grade"}:</strong> ${
        plan.grade || "-"
      }</p>
          <p><strong>${lang === "zh" ? "時長" : "Duration"}:</strong> ${
        plan.duration || "-"
      } ${lang === "zh" ? "分鐘" : "minutes"}</p>
          <p><strong>${
            lang === "zh" ? "學生人數" : "Student Count"
          }:</strong> ${plan.student_count || "-"}</p>
          <p><strong>${
            lang === "zh" ? "教室設備" : "Classroom Equipment"
          }:</strong> ${plan.classroom_equipment || "-"}</p>
        </div>
        
        <div class="plan-detail-section">
          <h3>${lang === "zh" ? "教學理念" : "Teaching Rationale"}</h3>
          <div class="generated-content">${plan.rationale || "-"}</div>
        </div>
        
        <div class="plan-detail-section">
          <h3>${lang === "zh" ? "學習目標" : "Learning Objectives"}</h3>
          <div class="generated-content">${plan.objectives || "-"}</div>
        </div>
        
        <div class="plan-detail-section">
          <h3>${lang === "zh" ? "教學策略" : "Teaching Strategies"}</h3>
          <div class="generated-content">${plan.strategies || "-"}</div>
        </div>
        
        <div class="plan-detail-section">
          <h3>${lang === "zh" ? "教學流程" : "Teaching Flow"}</h3>
          <div class="generated-content">${plan.teaching_flow || "-"}</div>
        </div>
        
        <div class="plan-detail-section">
          <h3>${lang === "zh" ? "學習單" : "Worksheet"}</h3>
          <div class="generated-content">${plan.worksheet || "-"}</div>
        </div>
      `;

      if (plan.gamma_url) {
        html += `
          <div class="plan-detail-section">
            <h3>${lang === "zh" ? "PPT 簡報" : "PPT Presentation"}</h3>
            <a href="${
              plan.gamma_url
            }" target="_blank" class="btn btn-primary" style="display: inline-block; margin-top: 10px;">
              ${lang === "zh" ? "查看 Gamma 簡報" : "View Gamma Presentation"}
            </a>
          </div>
        `;
      }

      detailContent.innerHTML = html;
    }
  } catch (error) {
    console.error("載入詳情失敗:", error);
    const currentLang = localStorage.getItem("currentLanguage") || "zh";
    alert(currentLang === "zh" ? "載入詳情失敗" : "Failed to load details");
  }
}

// 返回歷史記錄
function goBackToHistory() {
  showHistoryPage();
}

// 保存課程計劃
async function saveCoursePlan() {
  try {
    const saveData = {
      title: document.getElementById("title").value,
      grade: document.getElementById("grade").value,
      duration: parseInt(document.getElementById("duration").value),
      student_count: parseInt(document.getElementById("student-count").value),
      classroom_equipment: document.getElementById("equipment").value,
      rationale: courseData.rationale,
      objectives: courseData.objectives,
      strategies: courseData.strategies,
      teaching_flow: courseData.teaching_flow,
      worksheet: courseData.worksheet,
      ai_model: localStorage.getItem("selectedAiModel") || "openai",
      ai_submodel: localStorage.getItem("selectedAiSubmodel") || "gpt-4o-mini",
      language: localStorage.getItem("currentLanguage") || "zh",
      gamma_url: localStorage.getItem("gammaUrl") || null,
    };

    const response = await fetch(`${API_BASE_URL}/course-plans/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saveData),
    });

    const result = await response.json();

    if (response.ok) {
      const currentLang = localStorage.getItem("currentLanguage") || "zh";
      alert(currentLang === "zh" ? "課程計劃已保存" : "Course plan saved");
      // 重新載入歷史記錄
      await loadHistoryList();
    } else {
      throw new Error(result.detail || "保存失敗");
    }
  } catch (error) {
    console.error("保存失敗:", error);
    const currentLang = localStorage.getItem("currentLanguage") || "zh";
    alert(
      (currentLang === "zh" ? "保存失敗：" : "Save failed: ") + error.message
    );
  }
}
