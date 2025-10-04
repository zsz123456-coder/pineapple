// Supabase配置
const SUPABASE_URL = 'https://erleoheujnaycloilbzq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVybGVvaGV1am5heWNsb2lsYnpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDMzNzgsImV4cCI6MjA3NTA3OTM3OH0.FmSS0vsZ0JEkJU-NRwyR5KU3WJ7YVwTlKe6gV5LXzTo';

// 全局状态
let supabase = null;
let currentUser = null;
let isEditingMode = false;
let isSupabaseAvailable = false;
let isInitialized = false;
let currentPage = 1;
const imagesPerPage = 6;
let galleryImages = [];

// 简化的Supabase初始化
function initializeSupabase() {
    if (isInitialized) {
        console.log('Supabase已经初始化过');
        return true;
    }
    
    try {
        if (typeof window.supabase === 'undefined') {
            console.error('Supabase库未加载');
            return false;
        }
        
        // 创建Supabase客户端
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true
            }
        });
        
        isInitialized = true;
        console.log('Supabase客户端初始化成功');
        return true;
    } catch (error) {
        console.error('Supabase初始化失败:', error);
        return false;
    }
}

// 测试Supabase连接
async function testSupabaseConnection() {
    try {
        console.log('开始测试Supabase连接...');
        
        // 简单查询测试
        const { data, error } = await supabase
            .from('page_content')
            .select('key, content')
            .limit(1);
        
        if (error) {
            console.error('Supabase连接测试失败:', error);
            isSupabaseAvailable = false;
            return false;
        }
        
        console.log('Supabase连接测试成功，表数据正常');
        isSupabaseAvailable = true;
        return true;
} catch (error) {
        console.error('Supabase连接测试异常:', error);
        isSupabaseAvailable = false;
        return false;
    }
}

// 等待Supabase库加载
function waitForSupabase(callback, maxAttempts = 10, interval = 1000) {
    let attempts = 0;
    
    function check() {
        attempts++;
        console.log(`检查Supabase库加载状态，尝试次数: ${attempts}`);
        
        if (typeof window.supabase !== 'undefined') {
            console.log('Supabase库已加载');
            if (initializeSupabase()) {
                console.log('开始测试连接...');
                testSupabaseConnection().then(connected => {
                    if (connected) {
                        console.log('Supabase连接成功，开始加载数据');
                        callback();
                    } else {
                        console.log('Supabase连接失败，使用本地模式');
                        useFallbackMode();
                        callback();
                    }
                });
                return;
            }
        }
        
        if (attempts < maxAttempts) {
            setTimeout(check, interval);
        } else {
            console.log('Supabase库加载超时，使用本地模式');
            useFallbackMode();
            callback();
        }
    }
    
    check();
}

// 备用模式
function useFallbackMode() {
    console.log('进入备用模式，使用本地存储');
    isSupabaseAvailable = false;
    loadFromLocalStorage();
}

// 从Supabase加载数据
async function loadTraceabilityData() {
    if (!isSupabaseAvailable || !supabase) {
        console.log('Supabase不可用，使用本地数据');
        loadFromLocalStorage();
        return;
    }
    
    try {
        console.log('从Supabase加载数据...');
        const { data, error } = await supabase
            .from('page_content')
            .select('key, content, section')
            .order('created_at', { ascending: true });
        
        if (error) {
            console.error('从Supabase加载数据失败:', error);
            loadFromLocalStorage();
            return;
        }
        
        if (data && data.length > 0) {
            console.log(`从Supabase成功加载 ${data.length} 条数据`);
            
            // 转换数据格式
            const pageContent = {};
            data.forEach(item => {
                pageContent[item.key] = item.content;
            });
            
            // 更新页面
            updatePageContent(pageContent);
            
            // 保存到本地作为缓存
saveToLocalStorage(pageContent);
        } else {
            console.log('Supabase中没有数据，使用本地数据');
            loadFromLocalStorage();
        }
    } catch (error) {
console.error('加载数据异常:', error);
        loadFromLocalStorage();
    }
}

// 保存到本地存储
function saveToLocalStorage(content) {
    try {
        localStorage.setItem('pineappleContent', JSON.stringify(content));
        console.log('数据已保存到本地存储');
    } catch (error) {
        console.error('保存到本地存储失败:', error);
    }
}

// 从本地存储加载数据
function loadFromLocalStorage() {
    try {
        const savedContent = localStorage.getItem('pineappleContent');
        if (savedContent) {
            const content = JSON.parse(savedContent);
            updatePageContent(content);
            console.log('从本地存储加载数据成功');
        } else {
            console.log('本地存储中没有数据，插入示例数据');
            insertSampleData();
        }
        
        // 加载图片数据
loadGalleryFromLocalStorage();
    } catch (error) {
        console.error('加载本地数据失败:', error);
        insertSampleData();
    }
}

// 插入示例数据
function insertSampleData() {
    const sampleContent = {
        'hero_title': '科技赋能农业 · 溯源保障品质',
        'hero_subtitle': '广工揭阳校区团队助力凤梨产业发展',
        'orchard_title': '优质凤梨种植基地',
        'orchard_description': '我们的凤梨种植基地位于揭阳市优质农业区，拥有得天独厚的自然条件：充足的阳光照射、纯净的水源灌溉、肥沃的土壤环境、有机种植方式。',
        'farmer_message': '我们用心种植每一颗凤梨，就像照顾自己的孩子一样。希望您能品尝到最甜美的果实！',
        'growth_title': '凤梨生长过程',
        'growth_description': '从种植到采收的完整生长周期，确保每一颗凤梨都达到最佳品质。',
        'product_title': '产品信息',
        'product_description': '金钻凤梨：果肉细腻，甜度高，香气浓郁，重量1.5-2.0kg/个',
        'team_title': '团队介绍',
        'team_description': '我们是一支由电子商务专业学生组成的团队，致力于用科技赋能传统农业，为凤梨产业插上"科技的翅膀"。'
    };
    
    updatePageContent(sampleContent);
    saveToLocalStorage(sampleContent);
}

// 更新页面内容
function updatePageContent(content) {
    if (!content) return;
    
    const editableElements = document.querySelectorAll('[data-editable]');
    editableElements.forEach(element => {
        const key = element.getAttribute('data-editable');
        if (content[key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value = content[key];
            } else {
                element.textContent = content[key];
            }
        }
    });
}

// 保存内容到Supabase
async function saveContentToSupabase() {
    if (!isSupabaseAvailable || !supabase) {
        alert('网络连接不可用，内容已保存到本地');
        saveContentToLocal();
        return;
    }
    
    try {
        const content = {};
        const editableElements = document.querySelectorAll('[data-editable]');
        
        // 收集所有可编辑内容
        editableElements.forEach(element => {
            const key = element.getAttribute('data-editable');
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                content[key] = element.value;
            } else {
                content[key] = element.textContent;
            }
        });
        
        // 批量更新到Supabase
        const updates = Object.entries(content).map(([key, value]) => 
            supabase
                .from('page_content')
                .upsert({ 
                    key: key, 
                    content: value,
                    section: getSectionByKey(key)
                })
        );
        
        // 等待所有更新完成
        await Promise.all(updates);
        
        // 保存到本地作为备份
        saveToLocalStorage(content);
        
        alert('内容保存成功！');
        console.log('内容已保存到Supabase和本地存储');
    } catch (error) {
        console.error('保存到Supabase失败:', error);
        alert('保存失败，内容已保存到本地');
        saveContentToLocal();
    }
}

// 根据key获取section
function getSectionByKey(key) {
    const sectionMap = {
        'hero_title': 'hero',
        'hero_subtitle': 'hero',
        'orchard_title': 'orchard',
        'orchard_description': 'orchard',
        'farmer_message': 'orchard',
        'growth_title': 'growth',
        'growth_description': 'growth',
        'product_title': 'product',
'product_description': 'product',
        'team_title': 'team',
        'team_description': 'team'
    };
    return sectionMap[key] || 'general';
}

// 保存到本地
function saveContentToLocal() {
    const content = {};
    const editableElements = document.querySelectorAll('[data-editable]');
    
    editableElements.forEach(element => {
        const key = element.getAttribute('data-editable');
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            content[key] = element.value;
        } else {
            content[key] = element.textContent;
        }
    });
    
    saveToLocalStorage(content);
}

// 显示登录模态框（修复未定义错误）
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

// 显示注册模态框（修复未定义错误）
function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
}

// 关闭模态框
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 切换编辑模式
function toggleEditMode() {
    isEditingMode = !isEditingMode;
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const editableElements = document.querySelectorAll('[data-editable]');
    
    if (isEditingMode) {
        editBtn.textContent = '退出编辑';
        saveBtn.style.display = 'inline-block';
        
        // 使内容可编辑
        editableElements.forEach(element => {
            element.contentEditable = true;
            element.style.border = '1px dashed #ccc';
            element.style.padding = '5px';
            element.style.borderRadius = '3px';
        });
    } else {
        editBtn.textContent = '编辑内容';
        saveBtn.style.display = 'none';
        
        // 恢复不可编辑状态
        editableElements.forEach(element => {
            element.contentEditable = false;
            element.style.border = 'none';
            element.style.padding = '0';
        });
    }

    // 从Supabase存储桶删除图片
    async function deleteImageFromSupabase(fileName) {
        if (!isSupabaseAvailable || !supabase) {
            console.log('Supabase不可用，跳过存储桶删除');
            return;
        }
        
        try {
            console.log(`开始删除Supabase存储桶中的文件: ${fileName}`);
            
            const { error } = await supabase.storage
                .from('images')
                .remove([fileName]);
            
            if (error) {
                console.error('删除存储桶文件失败:', error);
                alert('警告：图片已从本地删除，但Supabase存储桶中的文件删除失败');
            } else {
                console.log('存储桶文件删除成功');
            }
        } catch (error) {
            console.error('删除存储桶文件过程异常:', error);
            alert('警告：图片已从本地删除，但Supabase存储桶删除过程出错');
        }
    }
}

// 保存内容
function saveContent() {
    if (isSupabaseAvailable) {
        saveContentToSupabase();
    } else {
        saveContentToLocal();
        alert('内容已保存到本地');
    }
}

// 检查认证状态
function checkAuthStatus() {
    if (!supabase) return;
    
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            currentUser = session.user;
console.log('用户已登录:', currentUser.email);
        } else {
            console.log('用户未登录');
        }
    });
}

// 网络状态检测
function checkNetworkStatus() {
    if (!navigator.onLine) {
        console.warn('设备处于离线状态');
        useFallbackMode();
        return Promise.resolve(false);
    }
    
    // 测试网络连接
    return fetch('https://erleoheujnaycloilbzq.supabase.co/rest/v1/', {
        method: 'HEAD',
        mode: 'no-cors'
    }).then(() => true).catch(() => {
        console.warn('Supabase 服务不可达');
        useFallbackMode();
        return false;
    });
}

// 初始化交互效果
function addInteractiveEffects() {
    console.log('初始化交互效果...');
    // 这里添加您的交互效果代码
    console.log('交互效果初始化完成');
}

// 绑定表单事件
function bindFormEvents() {
    console.log('绑定表单事件...');
    
    // 绑定编辑按钮
    const editBtn = document.getElementById('editBtn');
    if (editBtn) {
        editBtn.addEventListener('click', toggleEditMode);
    }
    
    // 绑定保存按钮
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveContent);
    }
    
    // 绑定登录按钮
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', showLoginModal);
    }
    
    // 绑定注册按钮
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', showRegisterModal);
    }
    
    // 绑定登录表单提交事件
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('登录表单绑定成功');
    } else {
        console.error('登录表单未找到');
    }
    
    // 绑定注册表单提交事件
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        console.log('注册表单绑定成功');
    } else {
        console.error('注册表单未找到');
    }
    
    console.log('表单事件绑定完成');
}

// 退出编辑模式
function exitEditMode() {
    isEditingMode = false;
    console.log('退出编辑模式');
    // 隐藏保存和退出按钮，显示进入编辑按钮
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const exitEditBtn = document.getElementById('exitEditBtn');
    const enterEditBtn = document.getElementById('enterEditBtn');
    
    if (saveChangesBtn) {
        saveChangesBtn.style.display = 'none';
    }
    if (exitEditBtn) {
        exitEditBtn.style.display = 'none';
    }
    if (enterEditBtn) {
        enterEditBtn.style.display = 'inline-block';
    }
    
    // 恢复不可编辑状态
    const editableElements = document.querySelectorAll('[data-editable]');
    editableElements.forEach(element => {
        element.contentEditable = false;
        element.style.border = 'none';
        element.style.padding = '0';
        element.style.backgroundColor = 'transparent';
    });
    
    alert('已退出编辑模式');
}

// 用户登录函数
async function signIn(email, password) {
    if (!supabase) {
        alert('系统未初始化完成，请稍后重试');
        return { success: false, error: 'Supabase未初始化' };
    }
    
    try {
        console.log('开始登录用户:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        
        if (error) throw error;
        
        currentUser = data.user;
        updateUIAfterLogin();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}


function playFarmerMessage() {
    // 这里可以添加真实的音频文件
    alert('果农寄语音频播放功能（需要真实音频文件）');
}


// 画廊相关函数
function saveGalleryToLocalStorage() {
    try {
        const imagesToSave = galleryImages.map(img => ({
            id: img.id,
            title: img.title,
            description: img.description,
            uploadDate: img.uploadDate,
            url: img.url
        }));
        localStorage.setItem('pineappleGallery', JSON.stringify(imagesToSave));
    } catch (error) {
        console.error('保存图片数据失败:', error);
    }
}

function loadGalleryFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('pineappleGallery');
        if (savedData) {
            const savedImages = JSON.parse(savedData);
galleryImages = savedImages;
            renderGallery();
            updateGalleryStats();
        }
    } catch (error) {
        console.error('加载图片数据失败:', error);
    }
}

function updateGalleryStats() {
    const countElement = document.getElementById('imageCount');
    if (countElement) {
        countElement.textContent = galleryImages.length;
    }
}

function renderGallery() {
    const gallery = document.getElementById('imageGallery');
    if (!gallery) return;
    
    gallery.innerHTML = '';
    
    const startIndex = (currentPage - 1) * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    const pageImages = galleryImages.slice(startIndex, endIndex);
    
    if (pageImages.length === 0) {
        gallery.innerHTML = '<div class="no-images">暂无图片，请上传图片</div>';
        updatePaginationControls();
        return;
    }
    
    pageImages.forEach(image => {
        const galleryItem = document.createElement('div');
galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <img src="${image.url}" alt="${image.title}" class="gallery-image">
            <div class="gallery-info">
                <h4 class="gallery-title">${image.title}</h4>
                <p class="gallery-description">${image.description || '暂无描述'}</p>
                <div class="gallery-actions">
                    <button class="delete-btn" onclick="deleteImage(${image.id})">删除</button>
                </div>
                <small>上传时间: ${image.uploadDate}</small>
            </div>
        `;
        gallery.appendChild(galleryItem);
    });
    
    updatePaginationControls();
}

function updatePaginationControls() {
    const totalPages = Math.ceil(galleryImages.length / imagesPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    
    pageInfo.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
    
    // 更新按钮状态
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderGallery();
        updatePaginationControls();
}
}

function nextPage() {
    const totalPages = Math.ceil(galleryImages.length / imagesPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderGallery();
        updatePaginationControls();
    }
}

function deleteImage(imageId) {
    if (!isEditingMode) {
        alert('请先进入编辑模式');
        return;
    }
    
    if (confirm('确定要删除这张图片吗？')) {
        // 找到要删除的图片
        const imageToDelete = galleryImages.find(img => img.id === imageId);
        
        if (imageToDelete) {
            console.log('开始删除图片:', imageToDelete);
            
            // 如果图片上传到了Supabase，同时删除存储桶中的文件
            if (imageToDelete.uploadedToSupabase && imageToDelete.fileName) {
                console.log('检测到Supabase图片，开始删除存储桶文件:', imageToDelete.fileName);
                deleteImageFromSupabase(imageToDelete.fileName);
            } else {
                console.log('图片未上传到Supabase，仅删除本地数据');
            }
            
            // 从本地数组中删除
            galleryImages = galleryImages.filter(img => img.id !== imageId);
            saveGalleryToLocalStorage();
            renderGallery();
            updateGalleryStats();
            
            alert('图片删除成功！');
        }
    }
}

function initGallery() {
    loadGalleryFromLocalStorage();
    
    const uploadBtn = document.getElementById('uploadImageBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', showUploadModal);
    }
    
    renderGallery();
    updateGalleryStats();
}

// 显示上传模态框
function showUploadModal() {
    if (!isEditingMode) {
        alert('请先进入编辑模式');
        return;
    }
    document.getElementById('uploadModal').style.display = 'block';
    
    // 重置表单
    document.getElementById('uploadForm').reset();
    document.getElementById('imagePreview').style.display = 'none';
    
    // 添加图片预览功能
    const imageFileInput = document.getElementById('imageFile');
    if (imageFileInput) {
        imageFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('previewImage').src = e.target.result;
                    document.getElementById('imagePreview').style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// 处理图片上传
function handleImageUpload(event) {
    event.preventDefault();
    console.log('图片上传表单提交事件触发');
    
    const title = document.getElementById('imageTitle')?.value.trim();
    const description = document.getElementById('imageDescription')?.value.trim();
    const file = document.getElementById('imageFile')?.files[0];
    
    console.log('上传表单数据:', { title, description, file: file ? file.name : '未选择文件' });
    
    if (!title) {
        alert('请输入图片标题');
        return;
    }
    
    if (!file) {
        alert('请选择图片文件');
        return;
    }
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件（JPG、PNG、GIF等格式）');
        return;
    }
    
    // 检查文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
        return;
    }
    
    try {
        // 创建图片对象
        const imageData = {
            id: Date.now(),
            title: title,
            description: description,
            file: file,
            url: URL.createObjectURL(file),
            uploadDate: new Date().toLocaleDateString('zh-CN'),
            fileName: file.name,
            fileSize: (file.size / 1024 / 1024).toFixed(2) + 'MB'
        };
        
        console.log('创建图片对象:', imageData);
        
        // 添加到图片数组
        galleryImages.push(imageData);
        
        // 保存到localStorage
        saveGalleryToLocalStorage();
        
        // 更新显示
        renderGallery();
        updateGalleryStats();
        
        // 关闭模态框
        closeModal('uploadModal');
        
        alert('图片上传成功！');
        
    } catch (error) {
        console.error('图片上传错误:', error);
        alert('图片上传失败：' + error.message);
    }
}

// 保存画廊数据到本地存储
function saveGalleryToLocalStorage() {
    try {
        // 只保存必要的数据，不保存File对象
        const saveData = galleryImages.map(img => ({
            id: img.id,
            title: img.title,
            description: img.description,
            url: img.url,
            uploadDate: img.uploadDate,
            fileName: img.fileName,
            fileSize: img.fileSize
        }));
        
        localStorage.setItem('pineappleGallery', JSON.stringify(saveData));
        console.log('画廊数据已保存到本地存储');
    } catch (error) {
        console.error('保存画廊数据失败:', error);
    }
}

// 从本地存储加载画廊数据
function loadGalleryFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('pineappleGallery');
        if (savedData) {
            const savedImages = JSON.parse(savedData);
            galleryImages = savedImages;
            console.log('从本地存储加载了', galleryImages.length, '张图片');
            renderGallery();
            updateGalleryStats();
        } else {
            console.log('本地存储中没有画廊数据');
        }
    } catch (error) {
        console.error('加载图片数据失败:', error);
    }
}

// 渲染图片画廊
function renderGallery() {
    const gallery = document.getElementById('imageGallery');
    gallery.innerHTML = '';
    
    // 计算当前页的图片范围
    const startIndex = (currentPage - 1) * imagesPerPage;
    const endIndex = Math.min(startIndex + imagesPerPage, galleryImages.length);
    const pageImages = galleryImages.slice(startIndex, endIndex);
    
    console.log(`渲染第${currentPage}页，显示图片 ${startIndex + 1}-${endIndex}，共${galleryImages.length}张`);
    
    if (pageImages.length === 0) {
        gallery.innerHTML = '<div class="no-images">暂无图片，请上传图片</div>';
        updatePaginationControls();
        return;
    }
    
    // 只渲染当前页的图片
    pageImages.forEach((image, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        
        // 根据编辑模式决定是否显示删除按钮
        const deleteButtonHtml = isEditingMode ? 
            `<button class="delete-btn" onclick="deleteImage(${image.id})">删除</button>` : 
            '';
        
        galleryItem.innerHTML = `
            <img src="${image.url}" alt="${image.title}" class="gallery-image" loading="lazy">
            <div class="gallery-info">
                <h4 class="gallery-title">${image.title}</h4>
                <p class="gallery-description">${image.description || '暂无描述'}</p>
                <div class="gallery-actions">
                    ${deleteButtonHtml}
                </div>
                <small>上传时间: ${image.uploadDate}</small>
            </div>
        `;
        gallery.appendChild(galleryItem);
    });
    
    updatePaginationControls();
}

// 更新画廊统计
function updateGalleryStats() {
    const imageCount = document.getElementById('imageCount');
    if (imageCount) {
        imageCount.textContent = galleryImages.length;
    }
}

// 删除图片
function deleteImage(imageId) {
    if (!isEditingMode) {
        alert('请先进入编辑模式');
        return;
    }
    
    if (confirm('确定要删除这张图片吗？')) {
// 找到要删除的图片
        const imageToDelete = galleryImages.find(img => img.id === imageId);
        
        if (imageToDelete) {
            console.log('开始删除图片:', imageToDelete);
            
            // 如果图片上传到了Supabase，同时删除存储桶中的文件
            if (imageToDelete.uploadedToSupabase && imageToDelete.fileName) {
                console.log('检测到Supabase图片，开始删除存储桶文件:', imageToDelete.fileName);
                deleteImageFromSupabase(imageToDelete.fileName);
            } else {
                console.log('图片未上传到Supabase，仅删除本地数据');
            }
            
            // 从本地数组中删除
            galleryImages = galleryImages.filter(img => img.id !== imageId);
            saveGalleryToLocalStorage();
            renderGallery();
            updateGalleryStats();
            
            alert('图片删除成功！');
        }
    }
}


function initGallery() {
    loadGalleryFromLocalStorage();
    
    // 绑定上传按钮事件
    const uploadBtn = document.getElementById('uploadImageBtn');
    if (uploadBtn) {
uploadBtn.addEventListener('click', showUploadModal);
    } else {
        console.error('上传按钮未找到');
    }
    
    // 绑定上传表单提交事件
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleImageUpload);
        console.log('上传表单绑定成功');
    } else {
        console.error('上传表单未找到');
    }
    
    // 初始化显示
    renderGallery();
    updateGalleryStats();
}

// 更新画廊统计
function updateGalleryStats() {
    document.getElementById('imageCount').textContent = galleryImages.length;
}

// 渲染图片画廊
function renderGallery() {
    const gallery = document.getElementById('imageGallery');
    gallery.innerHTML = '';
    
    // 计算当前页的图片范围
    const startIndex = (currentPage - 1) * imagesPerPage;
    const endIndex = Math.min(startIndex + imagesPerPage, galleryImages.length);
    const pageImages = galleryImages.slice(startIndex, endIndex);
    
    console.log(`渲染第${currentPage}页，显示图片 ${startIndex + 1}-${endIndex}，共${galleryImages.length}张`);
    
    if (pageImages.length === 0) {
        gallery.innerHTML = '<div class="no-images">暂无图片，请上传图片</div>';
        updatePaginationControls();
        return;
    }
    
    // 只渲染当前页的图片
    pageImages.forEach((image, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <img src="${image.url}" alt="${image.title}" class="gallery-image">
            <div class="gallery-info">
                <h4 class="gallery-title">${image.title}</h4>
                <p class="gallery-description">${image.description || '暂无描述'}</p>
                <div class="gallery-actions">
                    <button class="delete-btn" onclick="deleteImage(${image.id})">删除</button>
                </div>
                <small>上传时间: ${image.uploadDate}</small>
            </div>
        `;
        gallery.appendChild(galleryItem);
    });
    
    updatePaginationControls();
}

// 更新分页控制
function updatePaginationControls() {
    const totalPages = Math.ceil(galleryImages.length / imagesPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    pageInfo.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
    
    // 更新按钮状态
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
}

// 上一页
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        console.log(`切换到上一页：第${currentPage}页`);
        renderGallery();
        // 滚动到画廊顶部
        document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
    }
}

// 切换编辑模式
function toggleEditMode() {
    isEditingMode = !isEditingMode;
    const editBtn = document.getElementById('toggleEditBtn');
    
    if (isEditingMode) {
        editBtn.textContent = '🔓 退出编辑模式';
        editBtn.classList.add('edit-mode');
        alert('已进入编辑模式，可以删除图片');
    } else {
        editBtn.textContent = '🔒 进入编辑模式';
        editBtn.classList.remove('edit-mode');
        alert('已退出编辑模式');
    }
    
    // 重新渲染画廊以显示/隐藏删除按钮
    renderGallery();
}

// 下一页
function nextPage() {
    const totalPages = Math.ceil(galleryImages.length / imagesPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        console.log(`切换到下一页：第${currentPage}页`);
        renderGallery();
        // 滚动到画廊顶部
        document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
    }
}

// 初始化画廊
function initGallery() {
    currentPage = 1; // 重置到第一页
    console.log('初始化画廊，重置到第一页');
    renderGallery();
    updateGalleryStats();
}

// 简化的Supabase初始化 - 使用标准方式
function initializeSupabase() {
    if (isInitialized) {
        console.log('Supabase已经初始化过');
        return true;
    }
    
try {
        // 检查Supabase库是否加载
        if (typeof window.supabase === 'undefined') {
            console.error('Supabase库未加载');
            return false;
        }
// 使用标准方式创建Supabase客户端
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        isInitialized = true;
        console.log('Supabase客户端初始化成功');
        return true;
    } catch (error) {
        console.error('Supabase初始化失败:', error);
        return false;
    }
}

// 处理图片上传 - 简化版本
async function handleImageUpload(event) {
    event.preventDefault();
    console.log('图片上传表单提交事件触发');
    
    const title = document.getElementById('imageTitle')?.value.trim();
    const description = document.getElementById('imageDescription')?.value.trim();
    const file = document.getElementById('imageFile')?.files[0];
    
    if (!title) {
        alert('请输入图片标题');
        return;
    }
    
    if (!file) {
        alert('请选择图片文件');
        return;
    }
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件（JPG、PNG、GIF等格式）');
        return;
    }
    
    // 检查文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
return;
    }
    
    // 显示上传中状态
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '上传中...';
    submitBtn.disabled = true;
    
    try {
        let imageUrl;
        let uploadResult;
        
        // 优先尝试上传到Supabase
        if (isSupabaseAvailable && supabase) {
            console.log('尝试上传到Supabase存储桶...');
            uploadResult = await uploadImageToSupabase(file, title, description);
            
            if (uploadResult.success) {
                imageUrl = uploadResult.url;
                console.log('Supabase上传成功');
            } else {
                console.warn('Supabase上传失败，使用本地存储:', uploadResult.error);
                // 使用本地存储
                imageUrl = URL.createObjectURL(file);
            }
        } else {
            // 使用本地存储
            console.log('Supabase不可用，使用本地存储');
            imageUrl = URL.createObjectURL(file);
        }
        
        // 创建图片对象 - 修复：移除fileData变量
        const imageData = {
            id: Date.now(),
            title: title,
description: description,
            url: imageUrl,
            uploadDate: new Date().toLocaleDateString('zh-CN'),
            fileName: file.name,
            fileSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
            uploadedToSupabase: uploadResult?.success || false
        };
        
        console.log('创建图片对象:', imageData);
        
        // 添加到图片数组
        galleryImages.push(imageData);
        
        // 保存到localStorage
        saveGalleryToLocalStorage();
        
        // 更新显示
        renderGallery();
        updateGalleryStats();
        
        // 关闭模态框
        closeModal('uploadModal');
        
        if (uploadResult?.success) {
            alert('图片上传到Supabase成功！');
        } else {
            alert('图片已保存到本地');
        }
        
    } catch (error) {
        console.error('图片上传错误:', error);
        alert('图片上传失败：' + error.message);
    } finally {
        // 恢复按钮状态
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// 从Supabase存储桶删除图片
async function deleteImageFromSupabase(fileName) {
    if (!isSupabaseAvailable || !supabase) {
        console.log('Supabase不可用，跳过存储桶删除');
        return;
    }
    
    try {
        console.log(`开始删除Supabase存储桶中的文件: ${fileName}`);
        
        const { error } = await supabase.storage
            .from('images')
            .remove([fileName]);
        
        if (error) {
            console.error('删除存储桶文件失败:', error);
            alert('警告：图片已从本地删除，但Supabase存储桶中的文件删除失败');
        } else {
            console.log('存储桶文件删除成功');
        }
    } catch (error) {
        console.error('删除存储桶文件过程异常:', error);
        alert('警告：图片已从本地删除，但Supabase存储桶删除过程出错');
    }
}

// 从Supabase加载图片数据 - 简化版本
async function loadImagesFromSupabase() {
    if (!isSupabaseAvailable || !supabase) {
        console.log('Supabase不可用，从本地存储加载图片');
        loadGalleryFromLocalStorage();
        return;
    }
    
    try {
        console.log('从Supabase加载图片数据...');
        
        // 首先检查存储桶中是否有文件
        const { data: files, error: listError } = await supabase.storage
            .from('images')
            .list();
        
        if (listError) {
            console.error('列出存储桶文件失败:', listError);
            loadGalleryFromLocalStorage();
            return;
        }
        
        console.log('存储桶中的文件:', files);
        
        if (files && files.length > 0) {
            // 从存储桶加载图片 - 修复：过滤无效文件和正确生成标题
            const images = [];
            
            for (const file of files) {
                // 过滤无效文件
                if (!file.name || file.name === '.emptyFolderPlaceholder' || file.name.startsWith('.')) {
                    console.log('跳过无效文件:', file.name);
                    continue;
                }
                
                // 检查文件是否为图片
                const isImageFile = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name);
                if (!isImageFile) {
                    console.log('跳过非图片文件:', file.name);
                    continue;
                }
                
                // 获取文件的公开URL
                const { data: { publicUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(file.name);
                // 修复标题生成逻辑
                let title = '未命名图片';
                if (file.name.includes('_')) {
                    // 从文件名中提取标题（去掉时间戳部分）
                    const parts = file.name.split('_');
                    if (parts.length > 1) {
                        title = parts.slice(1).join('_').replace(/\.[^/.]+$/, "");
                    }
                } else {
                    // 如果没有下划线，直接使用文件名（去掉扩展名）
                    title = file.name.replace(/\.[^/.]+$/, "");
                }
                
                // 如果标题为空，使用默认标题
                if (!title || title.trim() === '') {
                    title = '未命名图片';
                }
                
                images.push({
                    id: Date.now() + Math.random(), // 生成唯一ID
                    title: title,
                    description: '从Supabase存储桶加载',
                    url: publicUrl,
                    uploadDate: new Date().toLocaleDateString('zh-CN'),
                    fileName: file.name,
                    fileSize: file.metadata?.size ? (file.metadata.size / 1024 / 1024).toFixed(2) + 'MB' : '未知',
                    uploadedToSupabase: true
                });
            }
            
            if (images.length > 0) {
                galleryImages = images;
                console.log(`从Supabase存储桶加载 ${images.length} 张图片`);
                
                // 保存到本地作为缓存
                saveGalleryToLocalStorage();
                
                // 更新显示
                renderGallery();
                updateGalleryStats();
            } else {
                console.log('Supabase存储桶中没有有效的图片文件，从本地存储加载');
                loadGalleryFromLocalStorage();
            }
        } else {
            console.log('Supabase存储桶中没有图片，从本地存储加载');
            loadGalleryFromLocalStorage();
        }
        
    } catch (error) {
        console.error('加载图片数据异常:', error);
        loadGalleryFromLocalStorage();
    }
}

// 文件转换为Base64的函数（备用）
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 简化图片上传到Supabase的函数
async function uploadImageToSupabase(file, title, description) {
if (!supabase || !isSupabaseAvailable) {
        console.log('Supabase不可用，使用本地存储');
        return { success: false, error: 'Supabase不可用' };
    }
    
    try {
        console.log('开始上传图片到Supabase存储桶...');
        
        // 生成唯一的文件名 - 修复路径问题
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const filePath = fileName; // 直接使用文件名，不需要images/前缀
        console.log('文件路径:', filePath);
        
        // 使用标准上传方式
        const { data, error } = await supabase.storage
            .from('images')
            .upload(filePath, file);
        
        if (error) {
            console.error('图片上传失败:', error);
            return { success: false, error: error.message };
        }
        
        console.log('图片上传成功:', data);
        
        // 获取公开URL
        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);
        
        console.log('图片公开URL:', publicUrl);
        
        // 注释掉数据库保存部分，因为gallery_images表不存在
        // 如果需要保存到数据库，需要先创建表
        /*
        try {
            const imageRecord = {
                title: title,
                description: description,
                file_name: fileName,
                file_path: filePath,
                url: publicUrl,
                file_size: file.size,
                mime_type: file.type,
                upload_date: new Date().toISOString()
            };
            
            const { data: dbData, error: dbError } = await supabase
                .from('gallery_images')
                .insert([imageRecord])
                .select();
            
            if (dbError) {
console.warn('保存图片信息到数据库失败（可忽略）:', dbError);
            } else {
                console.log('图片信息保存到数据库成功:', dbData);
            }
        } catch (dbError) {
            console.warn('数据库操作异常（可忽略）:', dbError);
        }
        */
        
        return { 
            success: true, 
            url: publicUrl,
            filePath: filePath,
            fileName: fileName
        };
        
    } catch (error) {
        console.error('图片上传过程异常:', error);
        return { success: false, error: error.message };
    }
}

// 处理图片上传 - 修复fileData变量问题
async function handleImageUpload(event) {
    event.preventDefault();
    console.log('图片上传表单提交事件触发');
    
    const title = document.getElementById('imageTitle')?.value.trim();
    const description = document.getElementById('imageDescription')?.value.trim();
    const file = document.getElementById('imageFile')?.files[0];
    
    if (!title) {
        alert('请输入图片标题');
        return;
    }
    
    if (!file) {
        alert('请选择图片文件');
        return;
    }
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件（JPG、PNG、GIF等格式）');
        return;
    }
    
    // 检查文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
        return;
    }
    
    // 显示上传中状态
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '上传中...';
    submitBtn.disabled = true;
    
    try {
        let imageUrl;
        let uploadResult;
        
        // 优先尝试上传到Supabase
        if (isSupabaseAvailable && supabase) {
            console.log('尝试上传到Supabase存储桶...');
            uploadResult = await uploadImageToSupabase(file, title, description);
            
            if (uploadResult.success) {
                imageUrl = uploadResult.url;
                console.log('Supabase上传成功');
            } else {
                console.warn('Supabase上传失败，使用本地存储:', uploadResult.error);
                // 使用本地存储
                imageUrl = URL.createObjectURL(file);
            }
        } else {
            // 使用本地存储
            console.log('Supabase不可用，使用本地存储');
            imageUrl = URL.createObjectURL(file);
        }
        
        // 创建图片对象 - 修复：移除未定义的fileData变量
        const imageData = {
            id: Date.now(),
            title: title,
            description: description,
            url: imageUrl,
            uploadDate: new Date().toLocaleDateString('zh-CN'),
            fileName: file.name,
            fileSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
            uploadedToSupabase: uploadResult?.success || false
        };
        
        console.log('创建图片对象:', imageData);
        
        // 添加到图片数组
        galleryImages.push(imageData);
        
        // 保存到localStorage
        saveGalleryToLocalStorage();
        
        // 更新显示
        renderGallery();
        updateGalleryStats();
        
        // 关闭模态框
        closeModal('uploadModal');
        
        if (uploadResult?.success) {
            alert('图片上传到Supabase成功！');
        } else {
            alert('图片已保存到本地');
        }
        
    } catch (error) {
        console.error('图片上传错误:', error);
        alert('图片上传失败：' + error.message);
    } finally {
        // 恢复按钮状态
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// 从Supabase加载图片数据 - 简化版本
async function loadImagesFromSupabase() {
    if (!isSupabaseAvailable || !supabase) {
        console.log('Supabase不可用，从本地存储加载图片');
        loadGalleryFromLocalStorage();
        return;
    }
    
    try {
        console.log('从Supabase加载图片数据...');
        
        // 首先检查存储桶中是否有文件
        const { data: files, error: listError } = await supabase.storage
            .from('images')
            .list();
        
        if (listError) {
            console.error('列出存储桶文件失败:', listError);
            loadGalleryFromLocalStorage();
            return;
        }
        
        console.log('存储桶中的文件:', files);
        
        if (files && files.length > 0) {
            // 从存储桶加载图片 - 修复：过滤无效文件和正确生成标题
            const images = [];
            
            for (const file of files) {
                // 过滤无效文件
                if (!file.name || file.name === '.emptyFolderPlaceholder' || file.name.startsWith('.')) {
                    console.log('跳过无效文件:', file.name);
                    continue;
                }
                
                // 检查文件是否为图片
                const isImageFile = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name);
                if (!isImageFile) {
                    console.log('跳过非图片文件:', file.name);
                    continue;
                }
                
                // 获取文件的公开URL
                const { data: { publicUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(file.name);
                
                // 修复标题生成逻辑
                let title = '未命名图片';
                if (file.name.includes('_')) {
                    // 从文件名中提取标题（去掉时间戳部分）
                    const parts = file.name.split('_');
                    if (parts.length > 1) {
                        title = parts.slice(1).join('_').replace(/\.[^/.]+$/, "");
                    }
                } else {
                    // 如果没有下划线，直接使用文件名（去掉扩展名）
                    title = file.name.replace(/\.[^/.]+$/, "");
                }
                
                // 如果标题为空，使用默认标题
                if (!title || title.trim() === '') {
                    title = '未命名图片';
                }
                
                images.push({
                    id: Date.now() + Math.random(), // 生成唯一ID
                    title: title,
                    description: '从Supabase存储桶加载',
                    url: publicUrl,
                    uploadDate: new Date().toLocaleDateString('zh-CN'),
                    fileName: file.name,
                    fileSize: file.metadata?.size ? (file.metadata.size / 1024 / 1024).toFixed(2) + 'MB' : '未知',
                    uploadedToSupabase: true
                });
            }
            
            if (images.length > 0) {
                galleryImages = images;
                console.log(`从Supabase存储桶加载 ${images.length} 张图片`);
                
                // 保存到本地作为缓存
                saveGalleryToLocalStorage();
// 更新显示
renderGallery();
                updateGalleryStats();
            } else {
                console.log('Supabase存储桶中没有有效的图片文件，从本地存储加载');
                loadGalleryFromLocalStorage();
            }
        } else {
            console.log('Supabase存储桶中没有图片，从本地存储加载');
            loadGalleryFromLocalStorage();
        }
        
    } catch (error) {
        console.error('加载图片数据异常:', error);
        loadGalleryFromLocalStorage();
    }
}

// 初始化画廊（支持Supabase和本地存储）
function initGallery() {
    // 优先从Supabase加载
    if (isSupabaseAvailable && supabase) {
        loadImagesFromSupabase();
    } else {
        loadGalleryFromLocalStorage();
}
    
    // 绑定上传按钮事件
    const uploadBtn = document.getElementById('uploadImageBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', showUploadModal);
    } else {
        console.error('上传按钮未找到');
    }
    
    // 绑定上传表单提交事件
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleImageUpload);
        console.log('上传表单绑定成功');
    } else {
        console.error('上传表单未找到');
    }
    
    // 初始化显示
    renderGallery();
    updateGalleryStats();
}

// 页面初始化 - 删除重复的监听器，只保留一个
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化...');
    
    // 防止重复初始化 - 使用更可靠的检查
    if (window.pageInitialized) {
        console.log('页面已经初始化过，跳过重复初始化');
        return;
    }
    window.pageInitialized = true;
    
    // 立即加载本地数据，确保页面有内容显示
    loadFromLocalStorage();
    
    // 初始化交互效果
    addInteractiveEffects();
    
    // 绑定表单事件
    bindFormEvents();
    
    // 初始化画廊
    initGallery();
    
    // 异步尝试Supabase连接
    setTimeout(() => {
        waitForSupabase(function() {
            console.log('Supabase初始化完成，重新加载数据');
            // Supabase连接成功后重新加载图片数据
            if (isSupabaseAvailable) {
                loadImagesFromSupabase();
            }
        });
    }, 500);
});

// 用户注册函数
async function signUp(email, password) {
    if (!supabase) {
        alert('系统未初始化完成，请稍后重试');
        return { success: false, error: 'Supabase未初始化' };
    }
    
    try {
        console.log('开始注册用户:', email);
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 更新UI显示登录状态
function updateUIAfterLogin() {
    // 隐藏登录注册按钮
    const authButtons = document.getElementById('authButtons');
    if (authButtons) {
        authButtons.style.display = 'none';
    }
    
    // 显示用户菜单
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
        userMenu.style.display = 'flex';
    }
    
    // 更新用户名显示
    const userName = document.getElementById('userName');
    if (userName && currentUser) {
        userName.textContent = currentUser.email || '管理员';
    }
    
    console.log('UI已更新为登录状态');
}

// 显示管理员面板
function showAdminPanel() {
    // 进入编辑模式
    enterEditMode();
}

// 进入编辑模式
function enterEditMode() {
    isEditingMode = true;
    console.log('进入编辑模式');
    
    // 显示保存和退出按钮
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const exitEditBtn = document.getElementById('exitEditBtn');
    const enterEditBtn = document.getElementById('enterEditBtn');
    
    if (saveChangesBtn) {
        saveChangesBtn.style.display = 'inline-block';
    }
    if (exitEditBtn) {
        exitEditBtn.style.display = 'inline-block';
    }
    if (enterEditBtn) {
        enterEditBtn.style.display = 'none';
    }
    
    // 使内容可编辑
    const editableElements = document.querySelectorAll('[data-editable]');
    editableElements.forEach(element => {
        element.contentEditable = true;
        element.style.border = '1px dashed #4CAF50';
        element.style.padding = '5px';
        element.style.borderRadius = '3px';
        element.style.backgroundColor = '#f9f9f9';
    });
    
    // 显示编辑提示
    alert('已进入编辑模式，您可以修改页面内容。修改完成后点击"保存修改"按钮保存。');
}

// 退出编辑模式
function exitEditMode() {
    isEditingMode = false;
    console.log('退出编辑模式');
    // 隐藏保存和退出按钮，显示进入编辑按钮
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const exitEditBtn = document.getElementById('exitEditBtn');
    const enterEditBtn = document.getElementById('enterEditBtn');
    
    if (saveChangesBtn) {
        saveChangesBtn.style.display = 'none';
    }
    if (exitEditBtn) {
        exitEditBtn.style.display = 'none';
    }
    if (enterEditBtn) {
        enterEditBtn.style.display = 'inline-block';
    }
    
    // 恢复不可编辑状态
    const editableElements = document.querySelectorAll('[data-editable]');
    editableElements.forEach(element => {
        element.contentEditable = false;
        element.style.border = 'none';
        element.style.padding = '0';
        element.style.backgroundColor = 'transparent';
    });
    
    alert('已退出编辑模式');
}

// 保存修改
function saveChanges() {
    if (isSupabaseAvailable) {
        saveContentToSupabase();
    } else {
        saveContentToLocal();
        alert('内容已保存到本地');
    }
}
// 用户退出登录
function logout() {
    if (!supabase) {
        alert('系统未初始化完成');
        return;
    }
    
    if (confirm('确定要退出登录吗？')) {
        supabase.auth.signOut().then(() => {
            currentUser = null;
            isEditingMode = false;
            // 更新UI为未登录状态
            updateUIAfterLogout();
            
            alert('已成功退出登录');
        }).catch(error => {
            console.error('退出登录失败:', error);
            alert('退出登录失败：' + error.message);
        });
    }
}

// 更新UI为退出登录状态
function updateUIAfterLogout() {
    // 显示登录注册按钮
    const authButtons = document.getElementById('authButtons');
    if (authButtons) {
        authButtons.style.display = 'block';
    }
    
    // 隐藏用户菜单
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
        userMenu.style.display = 'none';
    }
    
    // 退出编辑模式
    exitEditMode();
    
    console.log('UI已更新为退出登录状态');
}
// 切换编辑模式
function toggleEditMode() {
    if (isEditingMode) {
        exitEditMode();
    } else {
        enterEditMode();
    }
}

// 处理登录表单提交
async function handleLogin(event) {
    event.preventDefault();
    console.log('登录表单提交事件触发');
    
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        alert('请输入邮箱和密码');
        return;
    }
    
    const result = await signIn(email, password);
    
    if (result.success) {
        closeModal('loginModal');
        alert('登录成功！');
        
        // 登录成功后更新UI
        updateUIAfterLogin();
        
        // 自动进入编辑模式
        enterEditMode();
    } else {
        alert('登录失败：' + result.error);
    }
}

// 处理注册表单提交
async function handleRegister(event) {
    event.preventDefault();
    console.log('注册表单提交事件触发');
    
    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    const activationCode = document.getElementById('activationCode')?.value;
    
    console.log('表单数据:', { email, password, confirmPassword, activationCode });
    
    if (!email || !password || !confirmPassword || !activationCode) {
        alert('请填写所有字段');
        return;
    }
    
    // 验证激活码
    if (activationCode !== 'GDUT-PINEAPPLE') {
        alert('激活码错误，请联系管理员获取正确的激活码');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('密码不一致');
        return;
    }
    
    if (password.length < 6) {
        alert('密码至少6位');
        return;
    }
    
    console.log('开始调用Supabase注册...');
    const result = await signUp(email, password);
    
    if (result.success) {
        alert('注册成功！请检查邮箱验证邮件。');
        closeModal('registerModal');
        
        // 注册成功后自动登录
        const loginResult = await signIn(email, password);
        if (loginResult.success) {
            console.log('注册后自动登录成功');
            // 注册登录成功后更新UI并进入编辑模式
            updateUIAfterLogin();
            enterEditMode();
        }
    } else {
        alert('注册失败：' + result.error);
    }
}

// 用户登录函数
async function signIn(email, password) {
    if (!supabase) {
        alert('系统未初始化完成，请稍后重试');
        return { success: false, error: 'Supabase未初始化' };
    }
    
    try {
        console.log('开始登录用户:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        
        if (error) throw error;
        
        currentUser = data.user;
        updateUIAfterLogin();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 删除重复的handleImageUpload函数定义
// 删除重复的signIn函数定义