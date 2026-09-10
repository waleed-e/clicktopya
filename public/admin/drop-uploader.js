/**
 * Modern Drag & Drop Image Uploader Component for Clicktopya Admin
 * 
 * Supports:
 * - Drag & drop files onto dashed drop zone
 * - Click to open native file browser
 * - Immediate image preview with real aspect ratio
 * - Selected filename and human-readable file size display
 * - Replace button to easily pick a new image
 * - Remove button to clear image
 * - Smooth uploading spinner / progress state
 * - Strict frontend validation (format: jpg, jpeg, png, webp, gif; max size: 5MB)
 * - Friendly Arabic error messages
 * - Auto-upload to backend /api/upload and syncs hidden input value
 * - Preserves existing image on edit modes
 */
class ImageDropUploader {
  constructor(options) {
    this.containerId = options.containerId;
    this.hiddenInputId = options.hiddenInputId;
    this.initialUrl = options.initialUrl || '';
    this.onUploadSuccess = options.onUploadSuccess || null;
    this.onRemove = options.onRemove || null;
    this.label = options.label || 'صورة (اختياري)';
    this.maxSizeMB = options.maxSizeMB || 5;

    this.container = document.getElementById(this.containerId);
    this.hiddenInput = document.getElementById(this.hiddenInputId);
    this.currentUrl = this.initialUrl;
    this.isUploading = false;

    if (!this.container) {
      console.warn(`[ImageDropUploader] Container #${this.containerId} not found`);
      return;
    }

    this.render();
    this.bindEvents();

    if (this.currentUrl) {
      this.showPreview(this.currentUrl, 'الصورة الحالية');
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="drop-uploader-wrapper" style="margin-bottom: 1.25rem;">
        <label style="font-size: 0.85rem; font-weight: 700; color: #334155; display: block; margin-bottom: 0.5rem;">
          ${this.label}
        </label>

        <!-- Drop Zone (Empty State) -->
        <div class="drop-zone" style="
          border: 2px dashed #cbd5e1;
          border-radius: 16px;
          padding: 1.5rem 1rem;
          text-align: center;
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
          user-select: none;
        ">
          <input type="file" class="drop-zone-file-input" accept="image/png, image/jpeg, image/jpg, image/webp, image/gif" style="display: none;">
          
          <div class="drop-zone-prompt">
            <div style="
              width: 52px;
              height: 52px;
              margin: 0 auto 0.75rem auto;
              background: #fee2e2;
              color: #dc2626;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.4rem;
              transition: transform 0.2s ease;
            " class="drop-zone-icon-circle">
              <i class="fas fa-cloud-arrow-up"></i>
            </div>
            <p style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #0f172a;">
              اسحب الصورة وأفلتها هنا
            </p>
            <p style="margin: 0.25rem 0 0 0; font-size: 0.8rem; color: #64748b;">
              أو <span style="color: #dc2626; font-weight: 700; text-decoration: underline;">اضغط لتصفح ملفات جهازك</span>
            </p>
            <span style="display: inline-block; margin-top: 0.5rem; font-size: 0.75rem; color: #94a3b8; background: #e2e8f0; padding: 2px 8px; border-radius: 12px;">
              PNG, JPG, WEBP بحد أقصى ${this.maxSizeMB}MB
            </span>
          </div>

          <!-- Uploading Overlay State -->
          <div class="drop-zone-uploading" style="display: none; padding: 1rem 0;">
            <div style="display: inline-block; width: 32px; height: 32px; border: 3px solid #fca5a5; border-top-color: #dc2626; border-radius: 50%; animation: dropSpin 0.8s linear infinite;"></div>
            <p style="margin-top: 0.5rem; font-size: 0.85rem; font-weight: 700; color: #dc2626;">جاري رفع الصورة إلى الخادم بأمان...</p>
          </div>
        </div>

        <!-- Preview Card (Active State) -->
        <div class="drop-preview-card" style="
          display: none;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 0.85rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          align-items: center;
          gap: 1rem;
        ">
          <div style="position: relative; width: 72px; height: 72px; flex-shrink: 0; border-radius: 12px; overflow: hidden; background: #f1f5f9; border: 1px solid #cbd5e1; display: flex; align-items: center; justify-content: center;">
            <img class="drop-preview-img" src="" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          
          <div style="flex: 1; min-width: 0;">
            <p class="drop-file-name" style="margin: 0; font-size: 0.85rem; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; direction: ltr; text-align: right;">image.png</p>
            <p class="drop-file-size" style="margin: 0.15rem 0 0.5rem 0; font-size: 0.75rem; color: #64748b;">0 KB</p>
            
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button type="button" class="drop-btn-replace" style="
                background: #f1f5f9;
                color: #334155;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                padding: 4px 10px;
                font-size: 0.75rem;
                font-weight: 700;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                transition: all 0.2s;
              ">
                <i class="fas fa-arrows-rotate"></i> تغيير الصورة
              </button>

              <button type="button" class="drop-btn-remove" style="
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
                border-radius: 8px;
                padding: 4px 10px;
                font-size: 0.75rem;
                font-weight: 700;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                transition: all 0.2s;
              ">
                <i class="fas fa-trash-can"></i> إزالة
              </button>
            </div>
          </div>
        </div>

        <!-- Feedback & Error Message -->
        <div class="drop-zone-error" style="
          display: none;
          margin-top: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: #fef2f2;
          border-right: 3px solid #dc2626;
          border-radius: 6px;
          color: #b91c1c;
          font-size: 0.8rem;
          font-weight: 600;
        "></div>
      </div>
    `;

    // Inject spinner keyframe if not already present
    if (!document.getElementById('drop-uploader-style')) {
      const style = document.createElement('style');
      style.id = 'drop-uploader-style';
      style.textContent = `
        @keyframes dropSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .drop-zone.is-dragover {
          border-color: #dc2626 !important;
          background: #fef2f2 !important;
          transform: scale(1.01);
        }
        .drop-zone.is-dragover .drop-zone-icon-circle {
          transform: scale(1.15);
        }
      `;
      document.head.appendChild(style);
    }
  }

  bindEvents() {
    this.dropZone = this.container.querySelector('.drop-zone');
    this.fileInput = this.container.querySelector('.drop-zone-file-input');
    this.promptEl = this.container.querySelector('.drop-zone-prompt');
    this.uploadingEl = this.container.querySelector('.drop-zone-uploading');
    this.previewCard = this.container.querySelector('.drop-preview-card');
    this.previewImg = this.container.querySelector('.drop-preview-img');
    this.fileNameEl = this.container.querySelector('.drop-file-name');
    this.fileSizeEl = this.container.querySelector('.drop-file-size');
    this.replaceBtn = this.container.querySelector('.drop-btn-replace');
    this.removeBtn = this.container.querySelector('.drop-btn-remove');
    this.errorEl = this.container.querySelector('.drop-zone-error');

    // Click drop zone opens file picker
    this.dropZone.addEventListener('click', () => {
      if (!this.isUploading) {
        this.fileInput.click();
      }
    });

    // Replace button opens file picker
    this.replaceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.fileInput.click();
    });

    // Remove button resets to empty state
    this.removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clear();
      if (typeof this.onRemove === 'function') {
        this.onRemove();
      }
    });

    // File input change
    this.fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        this.processFile(file);
      }
    });

    // Drag & Drop event listeners
    ['dragenter', 'dragover'].forEach(evtName => {
      this.dropZone.addEventListener(evtName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!this.isUploading) {
          this.dropZone.classList.add('is-dragover');
        }
      });
    });

    ['dragleave', 'dragend', 'drop'].forEach(evtName => {
      this.dropZone.addEventListener(evtName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.remove('is-dragover');
      });
    });

    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.isUploading) return;

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        this.processFile(files[0]);
      }
    });
  }

  showError(msg) {
    if (!this.errorEl) return;
    this.errorEl.textContent = msg;
    this.errorEl.style.display = 'block';
  }

  hideError() {
    if (!this.errorEl) return;
    this.errorEl.textContent = '';
    this.errorEl.style.display = 'none';
  }

  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  validateFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      this.showError('نوع الملف غير مدعوم. الصيغ المسموحة: JPG, PNG, WEBP, GIF');
      return false;
    }

    const maxBytes = this.maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      this.showError(`حجم الصورة يتجاوز الحد المسموح (${this.maxSizeMB} ميجابايت).`);
      return false;
    }

    return true;
  }

  async processFile(file) {
    this.hideError();

    if (!this.validateFile(file)) {
      this.fileInput.value = '';
      return;
    }

    // Read base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;

      // Show immediate preview
      this.showPreview(dataUrl, file.name, file.size);

      // Start upload
      await this.uploadToServer(dataUrl, file.name);
    };

    reader.onerror = () => {
      this.showError('حدث خطأ أثناء قراءة الملف من جهازك.');
    };

    reader.readAsDataURL(file);
  }

  showPreview(url, fileName = 'صورة محددة', fileSize = null) {
    this.previewImg.src = url;
    this.fileNameEl.textContent = fileName;
    this.fileSizeEl.textContent = fileSize ? this.formatFileSize(fileSize) : '';
    this.dropZone.style.display = 'none';
    this.previewCard.style.display = 'flex';
  }

  async uploadToServer(dataUrl, originalName) {
    this.isUploading = true;
    this.showUploadingState(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          image: dataUrl,
          filename: originalName
        })
      });

      const data = await res.json();

      if (res.ok && data.url) {
        this.currentUrl = data.url;
        if (this.hiddenInput) {
          this.hiddenInput.value = data.url;
        }
        if (typeof this.onUploadSuccess === 'function') {
          this.onUploadSuccess(data.url, data);
        }
      } else {
        this.showError(data.message || 'فشل رفع الصورة إلى الخادم.');
        this.clear();
      }
    } catch (err) {
      console.error('[ImageDropUploader] Upload error:', err);
      this.showError('فشل الاتصال بالخادم أثناء رفع الصورة.');
      this.clear();
    } finally {
      this.isUploading = false;
      this.showUploadingState(false);
    }
  }

  showUploadingState(uploading) {
    if (uploading) {
      this.dropZone.style.display = 'block';
      this.previewCard.style.display = 'none';
      this.promptEl.style.display = 'none';
      this.uploadingEl.style.display = 'block';
    } else {
      this.uploadingEl.style.display = 'none';
      this.promptEl.style.display = 'block';
      if (this.currentUrl) {
        this.dropZone.style.display = 'none';
        this.previewCard.style.display = 'flex';
      } else {
        this.dropZone.style.display = 'block';
        this.previewCard.style.display = 'none';
      }
    }
  }

  setValue(url, displayName = 'الصورة الحالية') {
    this.currentUrl = url || '';
    if (this.hiddenInput) {
      this.hiddenInput.value = this.currentUrl;
    }
    this.hideError();

    if (this.currentUrl) {
      this.showPreview(this.currentUrl, displayName);
    } else {
      this.clear();
    }
  }

  getValue() {
    return this.currentUrl || (this.hiddenInput ? this.hiddenInput.value : '');
  }

  clear() {
    this.currentUrl = '';
    if (this.hiddenInput) {
      this.hiddenInput.value = '';
    }
    if (this.fileInput) {
      this.fileInput.value = '';
    }
    this.previewImg.src = '';
    this.previewCard.style.display = 'none';
    this.dropZone.style.display = 'block';
    this.hideError();
  }
}

// Export for global browser use
window.ImageDropUploader = ImageDropUploader;
