/**
 * 課程計劃生成器 - 前端應用
 */

const API_BASE_URL = "http://localhost:8000";

// 初始化
let currentStep = 1;
let courseData = {};

// DOM 載入後初始化
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
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
    const savedModel = localStorage.getItem("ai_model") || "openai";
    const savedSubmodel = localStorage.getItem("ai_submodel");

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
      await generateObjectives();
      proceedToStep(3);
    });
  document
    .getElementById("regenerate-rationale")
    .addEventListener("click", regenerateRationale);

  // Step 3: 學習目標
  document
    .getElementById("confirm-objectives")
    .addEventListener("click", async () => {
      await generateStrategies();
      proceedToStep(4);
    });
  document
    .getElementById("regenerate-objectives")
    .addEventListener("click", regenerateObjectives);

  // Step 4: 教學策略
  document
    .getElementById("confirm-strategies")
    .addEventListener("click", async () => {
      await generateFlow();
      proceedToStep(5);
    });
  document
    .getElementById("regenerate-strategies")
    .addEventListener("click", regenerateStrategies);

  // Step 5: 教學流程
  document
    .getElementById("generate-materials")
    .addEventListener("click", generateMaterials);
  document
    .getElementById("regenerate-flow")
    .addEventListener("click", regenerateFlow);
  document
    .getElementById("toggle-gamma-settings")
    .addEventListener("click", toggleGammaSettings);

  // 最終下載
  document
    .getElementById("download-all")
    .addEventListener("click", downloadAll);

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

  showStatus(
    `已選擇 ${aiModel === "openai" ? "OpenAI" : "Claude"}，API Key 已預設配置`,
    "success"
  );

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
    const requestData = {
      title: courseData.title,
      grade: courseData.grade,
      duration: courseData.duration,
      student_count: courseData.student_count,
      classroom_equipment: courseData.classroom_equipment,
      upload_content: courseData.upload_content || "",
      ai_model: aiModel,
    };

    console.log("📤 發送給後端的完整數據:", requestData);

    // 加入子模型選擇（如果沒有選擇則使用預設）
    const aiSubmodel = localStorage.getItem("ai_submodel") || (aiModel === "openai" ? "gpt-4o" : "claude-3-5-sonnet-20241022");
    requestData.ai_submodel = aiSubmodel;

    // 呼叫後端 API 生成教學理念
    const response = await fetch(`${API_BASE_URL}/courses/generate-rationale`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

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
  // 為每個側邊欄項目添加點擊事件
  for (let i = 1; i <= 6; i++) {
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
    // 如果已經生成過，直接顯示
    document.getElementById("objectives-content").textContent =
      courseData.objectives;
    return;
  }

  try {
    // 顯示載入狀態
    document.getElementById("objectives-content").textContent =
      "⌛ 正在生成學習目標...";

    // 獲取 AI 模型選擇
    const aiModel = localStorage.getItem("ai_model") || "openai";

    console.log("生成學習目標，使用模型:", aiModel);

    // 呼叫後端 API 生成學習目標
    const aiSubmodel = localStorage.getItem("ai_submodel") || (aiModel === "openai" ? "gpt-4o" : "claude-3-5-sonnet-20241022");
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
        }),
      }
    );

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
    document.getElementById("objectives-content").textContent =
      "❌ 生成失敗，請稍後重試";
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
    return;
  }

  try {
    document.getElementById("strategies-content").textContent =
      "⌛ 正在生成教學策略...";
    const aiModel = localStorage.getItem("ai_model") || "openai";

    const aiSubmodel = localStorage.getItem("ai_submodel") || (aiModel === "openai" ? "gpt-4o" : "claude-3-5-sonnet-20241022");
    const response = await fetch(
      `${API_BASE_URL}/courses/generate-strategies`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...courseData,
          ai_model: aiModel,
          ai_submodel: aiSubmodel,
        }),
      }
    );

    const data = await response.json();
    if (data.status === "success") {
      document.getElementById("strategies-content").textContent =
        data.strategies;
      courseData.strategies = data.strategies;
      console.log(`📊 教學策略內容長度: ${data.strategies?.length || 0} 字元`);
    }
  } catch (error) {
    console.error("生成教學策略失敗:", error);
    document.getElementById("strategies-content").textContent =
      "❌ 生成失敗，請稍後重試";
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
    return;
  }

  try {
    document.getElementById("flow-content").textContent =
      "⌛ 正在生成教學流程...";
    const aiModel = localStorage.getItem("ai_model") || "openai";

    const aiSubmodel = localStorage.getItem("ai_submodel") || (aiModel === "openai" ? "gpt-4o" : "claude-3-5-sonnet-20241022");
    const response = await fetch(`${API_BASE_URL}/courses/generate-flow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...courseData,
        ai_model: aiModel,
        ai_submodel: aiSubmodel,
      }),
    });

    const data = await response.json();
    if (data.status === "success") {
      document.getElementById("flow-content").textContent = data.flow;
      courseData.teaching_flow = data.flow;
      console.log(`📊 教學流程內容長度: ${data.flow?.length || 0} 字元`);
    }
  } catch (error) {
    console.error("生成教學流程失敗:", error);
    document.getElementById("flow-content").textContent =
      "❌ 生成失敗，請稍後重試";
  }
}

async function regenerateFlow() {
  console.log("重新生成教學流程");
}

function toggleGammaSettings() {
  const settingsPanel = document.getElementById("gamma-settings-panel");
  const toggleBtn = document.getElementById("toggle-gamma-settings");

  if (settingsPanel.style.display === "none") {
    settingsPanel.style.display = "block";
    toggleBtn.textContent = "❌ 關閉設定";
    toggleBtn.classList.add("btn-active");
  } else {
    settingsPanel.style.display = "none";
    toggleBtn.textContent = "⚙️ Gamma 設定";
    toggleBtn.classList.remove("btn-active");
  }
}

async function generateMaterials() {
  console.log("生成教學材料 - 使用 Gamma API");

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

  // 顯示載入狀態
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

          // 跳轉到下一步並顯示結果
          proceedToStep(6);
          showMaterialResult(data.gamma_url);
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
