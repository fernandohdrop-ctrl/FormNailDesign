// ===== GLOBAL STATE =====
let servicoIndex = 1;

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
    initProgressBar();
    initFormValidation();
    initToggleSwitch();
    initPriceMask();
    initConditionalOtherFields(); // Initialize logic for 'Outro' fields
    updateProgressBar();
});

// ===== PROGRESS BAR =====
function initProgressBar() {
    window.addEventListener('scroll', updateProgressBar);
}

function updateProgressBar() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById('progressBar').style.width = scrolled + '%';
}

// ===== DYNAMIC SERVICES =====
function addServico() {
    const container = document.getElementById('servicosContainer');
    const newItem = document.createElement('div');
    newItem.className = 'servico-item';
    newItem.dataset.index = servicoIndex;

    newItem.innerHTML = `
        <div class="servico-grid">
            <div class="servico-field">
                <label>Nome do serviço</label>
                <input type="text" name="servicos[${servicoIndex}][nome]" placeholder="Nome do serviço">
            </div>
            <div class="servico-field">
                <label>Preço</label>
                <input type="text" name="servicos[${servicoIndex}][preco]" class="preco-input" placeholder="R$ 0,00">
            </div>
            <div class="servico-field">
                <label>Duração</label>
                <input type="text" name="servicos[${servicoIndex}][duracao]" class="duracao-input" placeholder="Ex: 45 min">
            </div>
            <button type="button" class="btn-remove-servico" onclick="removeServico(this)" title="Remover serviço">
                <span>✕</span>
            </button>
        </div>
    `;

    container.appendChild(newItem);
    servicoIndex++;

    // Add price mask to new input
    const newPriceInput = newItem.querySelector('.preco-input');
    newPriceInput.addEventListener('input', handlePriceMask);
    newPriceInput.focus();
}

function removeServico(button) {
    const container = document.getElementById('servicosContainer');
    const items = container.querySelectorAll('.servico-item');

    if (items.length <= 1) {
        showError('servicosError', 'É necessário ter pelo menos 1 serviço');
        return;
    }

    const item = button.closest('.servico-item');
    item.classList.add('removing');

    setTimeout(() => {
        item.remove();
        hideError('servicosError');
    }, 300);
}

// ===== PRICE MASK =====
function initPriceMask() {
    document.querySelectorAll('.preco-input').forEach(input => {
        input.addEventListener('input', handlePriceMask);
    });
}

function handlePriceMask(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value === '') {
        e.target.value = '';
        return;
    }

    value = parseInt(value, 10);
    value = (value / 100).toFixed(2);
    value = value.replace('.', ',');
    value = 'R$ ' + value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    e.target.value = value;
}

// ===== TOGGLE SWITCH =====
function initToggleSwitch() {
    const toggle = document.getElementById('agendamentoMesmoDia');
    const label = toggle?.parentElement.querySelector('.toggle-label');

    if (toggle && label) {
        toggle.addEventListener('change', () => {
            label.textContent = toggle.checked ? 'Sim' : 'Não';
        });
    }
}

// ===== CONDITIONAL FIELDS (TAXA E OUTROS) =====
function toggleTaxaDeslocamento(show) {
    const field = document.getElementById('taxaDeslocamentoField');
    if (field) {
        field.style.display = show ? 'block' : 'none';

        // If hiding, optional: clear the textarea
        if (!show) {
            const textarea = field.querySelector('textarea');
            if (textarea) textarea.value = '';
        }
    }
}

function initConditionalOtherFields() {
    // 1. Checkboxes "Outro"
    const otherCheckboxes = document.querySelectorAll('.check-outro');
    otherCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const targetId = e.target.dataset.target;
            const targetDiv = document.getElementById(targetId);
            if (targetDiv) {
                targetDiv.style.display = e.target.checked ? 'block' : 'none';
                if (e.target.checked) {
                    const input = targetDiv.querySelector('input');
                    if (input) input.focus();
                } else {
                    const input = targetDiv.querySelector('input');
                    if (input) input.value = ''; // clear when unchecked
                }
            }
        });
    });

    // 2. Selects with "Outro" (Antecedência Minima is the only select-based 'other' currently)
    const antecedenciaSelect = document.getElementById('antecedenciaMinima');
    if (antecedenciaSelect) {
        antecedenciaSelect.addEventListener('change', (e) => {
            const targetDiv = document.getElementById('antecedenciaMinimaOutro');
            if (targetDiv) {
                if (e.target.value === 'outro') {
                    targetDiv.style.display = 'block';
                    const input = targetDiv.querySelector('input');
                    if (input) input.focus();
                } else {
                    targetDiv.style.display = 'none';
                    const input = targetDiv.querySelector('input');
                    if (input) input.value = '';
                }
            }
        });
    }
}

// ===== FORM VALIDATION =====
function initFormValidation() {
    const form = document.getElementById('briefingForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const submitBtn = form.querySelector('.btn-submit');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        // Show loading
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        submitBtn.disabled = true;

        // Collect form data
        const formData = collectFormData();

        try {
            // Send to backend (Relative path, handled by Proxy in Dev and Same-Origin in Prod)
            const response = await fetch('/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showModal();
                form.reset(); // Clear form on success
                // Hide all conditional inputs
                document.querySelectorAll('.input-outro, .conditional-field').forEach(div => div.style.display = 'none');
            } else {
                throw new Error('Falha no envio');
            }
        } catch (error) {
            console.error('Erro:', error);
            showErrorModal();
        } finally {
            // Reset button
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    });

    // Real-time validation
    const requiredInputs = form.querySelectorAll('input[required], textarea[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.value.trim()) hideFieldError(input);
        });
    });
}

function validateForm() {
    let isValid = true;
    let firstErrorField = null;
    const form = document.getElementById('briefingForm');

    // Required fields
    const requiredFields = form.querySelectorAll('input[required], textarea[required]');
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
            if (!firstErrorField) firstErrorField = field;
        }
    });

    // Check if at least one service exists
    const servicos = document.querySelectorAll('.servico-item');
    if (servicos.length === 0) {
        showError('servicosError', 'Adicione pelo menos 1 serviço');
        isValid = false;
        if (!firstErrorField) firstErrorField = document.getElementById('servicosContainer');
    } else {
        // Check if first service has name
        const firstServicoName = servicos[0].querySelector('input[name*="[nome]"]');
        if (!firstServicoName.value.trim()) {
            showError('servicosError', 'Preencha o nome do serviço');
            isValid = false;
            if (!firstErrorField) firstErrorField = firstServicoName;
        }
    }

    if (firstErrorField) {
        // Scroll to the error (with some offset for fixed header if needed)
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (firstErrorField.focus) firstErrorField.focus();
    }

    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const errorSpan = field.parentElement.querySelector('.error-message');

    if (!value) {
        showFieldError(field, 'Este campo é obrigatório');
        return false;
    }

    hideFieldError(field);
    return true;
}

function showFieldError(field, message) {
    const errorSpan = field.parentElement.querySelector('.error-message');
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.classList.add('show');
    }
    field.style.borderColor = 'var(--color-error)';
}

function hideFieldError(field) {
    const errorSpan = field.parentElement.querySelector('.error-message');
    if (errorSpan) {
        errorSpan.classList.remove('show');
    }
    field.style.borderColor = '';
}

function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.classList.add('show');
    }
}

function hideError(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.classList.remove('show');
    }
}

// ===== COLLECT FORM DATA =====
function collectFormData() {
    const form = document.getElementById('briefingForm');
    const formData = new FormData(form);
    const data = {};

    // Simple fields
    const simpleFields = [
        'nomeNegocio', 'tempoAtuacao', 'localizacao', 'horarioFuncionamento',
        'estrutura', 'clientesSemana', 'pacotesPromocoes', 'taxaDeslocamento',
        'taxaDeslocamentoDescricao', 'comoFuncionaAgendamento', 'agendamentoMesmoDia',
        'antecedenciaMinima', 'horariosProcurados', 'prazoRemarcar', 'politicaCancelamento',
        'frequenciaRetorno', 'duvidasFrequentes1', 'duvidasFrequentes2', 'duvidasFrequentes3',
        'programaFidelidade', 'diferenciais', 'produtosTecnicas', 'posicionamento',
        'estiloCliente', 'tomAtendimento', 'usaEmojis', 'frasesBordoes',
        'restricoesAgente', 'alergiasInfo', 'instagram', 'linkPortfolio',
        'localizacaoMaps', 'infoAdicionais'
    ];

    simpleFields.forEach(field => {
        const value = formData.get(field);
        if (value !== null) {
            data[field] = value;
        }
    });

    // Special handling for Select "Outro" (Antecedencia Minima)
    if (data.antecedenciaMinima === 'outro') {
        const otherVal = formData.get('antecedenciaMinimaOutroInput');
        if (otherVal && otherVal.trim()) {
            data.antecedenciaMinima = `Outro: ${otherVal}`;
        }
    }

    // Checkbox fields + Handling "Outros" inputs within checkboxes
    const checkboxFields = [
        { name: 'formasPagamento', otherInput: 'formasPagamentoOutroInput' },
        { name: 'finaisSemana' },
        { name: 'faixaEtaria' },
        { name: 'perfilClientes', otherInput: 'perfilClientesOutroInput' },
        { name: 'objecoes', otherInput: 'objecoesOutroInput' },
        { name: 'especialidade', otherInput: 'especialidadeOutroInput' },
        { name: 'capacidadesIA', otherInput: 'capacidadesIAOutroInput' },
        { name: 'transferirHumano', otherInput: 'transferirHumanoOutroInput' }
    ];

    checkboxFields.forEach(fieldConfig => {
        let values = formData.getAll(fieldConfig.name);

        // If this checkbox group has an "Outro" input and "outros/outro" was selected
        if (fieldConfig.otherInput) {
            const hasOutro = values.some(v => v === 'outros' || v === 'outro');
            if (hasOutro) {
                const otherText = formData.get(fieldConfig.otherInput);
                if (otherText && otherText.trim()) {
                    // Remove "outros" placeholder and add the real text
                    values = values.filter(v => v !== 'outros' && v !== 'outro');
                    values.push(`Outro: ${otherText}`);
                }
            }
        }
        data[fieldConfig.name] = values;
    });

    // Services
    data.servicos = [];
    document.querySelectorAll('.servico-item').forEach((item, index) => {
        const nome = item.querySelector('input[name*="[nome]"]')?.value || '';
        const preco = item.querySelector('input[name*="[preco]"]')?.value || '';
        const duracao = item.querySelector('input[name*="[duracao]"]')?.value || '';

        if (nome.trim()) {
            data.servicos.push({ nome, preco, duracao });
        }
    });

    // Dúvidas frequentes array
    data.duvidasFrequentes = [
        data.duvidasFrequentes1,
        data.duvidasFrequentes2,
        data.duvidasFrequentes3
    ].filter(d => d && d.trim());
    delete data.duvidasFrequentes1;
    delete data.duvidasFrequentes2;
    delete data.duvidasFrequentes3;

    // Fix boolean
    data.agendamentoMesmoDia = document.getElementById('agendamentoMesmoDia')?.checked || false;

    return data;
}

// ===== MODAL =====
function showModal() {
    const modal = document.getElementById('successModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showErrorModal() {
    const modal = document.getElementById('errorModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeErrorModal() {
    const modal = document.getElementById('errorModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        if (document.getElementById('successModal').classList.contains('show')) closeModal();
        if (document.getElementById('errorModal').classList.contains('show')) closeErrorModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.getElementById('successModal').classList.contains('show')) closeModal();
        if (document.getElementById('errorModal').classList.contains('show')) closeErrorModal();
    }
});
