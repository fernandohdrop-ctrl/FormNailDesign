import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend (pasta dist gerada pelo build)
app.use(express.static('dist'));

// Configuração do Transporter (SMTP Hostinger)
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // true para 465, false para outras portas
    auth: {
        user: 'contato@agendaproai.com.br',
        pass: '@8736225Fer'
    }
});

// Template de Email HTML
const createEmailTemplate = (data) => {
    const servicosHtml = data.servicos.map(s =>
        `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${s.nome}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${s.preco}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${s.duracao}</td>
        </tr>`
    ).join('');

    const formatArray = (arr) => Array.isArray(arr) ? arr.join(', ') : arr || 'Não informado';

    // Função auxiliar para criar linhas de tabela de forma mais limpa
    const row = (label, value) => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; width: 30%; font-weight: bold; color: #4a5568;">${label}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; color: #2d3748;">${value || '-'}</td>
        </tr>
    `;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f7fafc; margin: 0; padding: 0; }
            .container { max-width: 800px; margin: 20px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background-color: #7c3aed; color: #fff; padding: 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .section { margin-bottom: 25px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
            .section-title { background-color: #edf2f7; padding: 10px 15px; font-weight: bold; color: #4a5568; border-bottom: 1px solid #e2e8f0; font-size: 16px; display: flex; align-items: center; }
            .section-icon { margin-right: 10px; font-size: 18px; }
            .data-table { width: 100%; border-collapse: collapse; }
            .footer { background-color: #2d3748; color: #cbd5e0; padding: 15px; text-align: center; font-size: 12px; }
            .tag { display: inline-block; background-color: #e9d8fd; color: #6b46c1; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 4px; margin-bottom: 4px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Novo Briefing Recebido 💅</h1>
                <p>Agente de IA para Nail Design</p>
            </div>
            
            <div class="content">
                
                <!-- SEÇÃO 1 -->
                <div class="section">
                    <div class="section-title"><span class="section-icon">🏢</span> Informações do Negócio</div>
                    <table class="data-table">
                        ${row('Nome', data.nomeNegocio)}
                        ${row('Tempo de Atuação', data.tempoAtuacao)}
                        ${row('Localização', data.localizacao)}
                        ${row('Horário', data.horarioFuncionamento)}
                        ${row('Estrutura', data.estrutura)}
                        ${row('Clientes/Semana', data.clientesSemana)}
                    </table>
                </div>

                <!-- SEÇÃO 2 -->
                <div class="section">
                    <div class="section-title"><span class="section-icon">⭐</span> Serviços e Precificação</div>
                    <div style="padding: 15px;">
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                            <thead>
                                <tr style="background-color: #f7fafc;">
                                    <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Serviço</th>
                                    <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Preço</th>
                                    <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Duração</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${servicosHtml}
                            </tbody>
                        </table>
                        <table class="data-table">
                            ${row('Pacotes/Promoções', data.pacotesPromocoes)}
                            ${row('Formas de Pagamento', formatArray(data.formasPagamento))}
                            ${row('Taxa Deslocamento', data.taxaDeslocamento === 'sim' ? `Sim - ${data.taxaDeslocamentoDescricao}` : 'Não')}
                        </table>
                    </div>
                </div>

                <!-- SEÇÃO 3 -->
                <div class="section">
                    <div class="section-title"><span class="section-icon">📅</span> Agendamento</div>
                    <table class="data-table">
                        ${row('Como funciona hoje', data.comoFuncionaAgendamento)}
                        ${row('Mesmo dia?', data.agendamentoMesmoDia ? 'Sim' : 'Não')}
                        ${row('Antecedência Mín.', data.antecedenciaMinima)}
                        ${row('Finais de Semana', formatArray(data.finaisSemana))}
                        ${row('Horários Procurados', data.horariosProcurados)}
                        ${row('Prazo Remarcar', data.prazoRemarcar)}
                        ${row('Política Cancel.', data.politicaCancelamento)}
                    </table>
                </div>

                <!-- SEÇÃO 4 -->
                <div class="section">
                    <div class="section-title"><span class="section-icon">👥</span> Público e Atendimento</div>
                    <table class="data-table">
                        ${row('Faixa Etária', formatArray(data.faixaEtaria))}
                        ${row('Perfil Clientes', formatArray(data.perfilClientes))}
                        ${row('Frequência Retorno', data.frequenciaRetorno)}
                        ${row('Dúvidas Frequentes', formatArray(data.duvidasFrequentes))}
                        ${row('Objeções', formatArray(data.objecoes))}
                        ${row('Programa Fidelidade', data.programaFidelidade)}
                    </table>
                </div>

                <!-- SEÇÃO 5 -->
                <div class="section">
                    <div class="section-title"><span class="section-icon">💎</span> Diferenciais</div>
                    <table class="data-table">
                        ${row('Diferenciais', data.diferenciais)}
                        ${row('Produtos/Técnicas', data.produtosTecnicas)}
                        ${row('Especialidade', formatArray(data.especialidade))}
                        ${row('Posicionamento', data.posicionamento)}
                    </table>
                </div>

                <!-- SEÇÃO 6 -->
                <div class="section">
                    <div class="section-title"><span class="section-icon">💬</span> Comunicação</div>
                    <table class="data-table">
                        ${row('Estilo Cliente', data.estiloCliente)}
                        ${row('Tom Atendimento', data.tomAtendimento)}
                        ${row('Usa Emojis?', data.usaEmojis)}
                        ${row('Frases/Bordões', data.frasesBordoes)}
                    </table>
                </div>

                 <!-- SEÇÃO 7 & 8 -->
                <div class="section">
                    <div class="section-title"><span class="section-icon">🤖</span> Fluxo e Restrições</div>
                    <table class="data-table">
                        ${row('Capacidades IA', formatArray(data.capacidadesIA))}
                        ${row('Transferir Humano', formatArray(data.transferirHumano))}
                        ${row('Restrições', data.restricoesAgente)}
                        ${row('Alergias/Cuidados', data.alergiasInfo)}
                        ${row('Instagram', data.instagram)}
                        ${row('Portfólio', data.linkPortfolio)}
                        ${row('Maps', data.localizacaoMaps)}
                        ${row('Info Adicional', data.infoAdicionais)}
                    </table>
                </div>

            </div>
            <div class="footer">
                <p>Enviado via Domu Solutions - Sistema de Briefing</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

app.post('/send-email', async (req, res) => {
    try {
        const formData = req.body;
        console.log('Dados recebidos:', formData);

        const htmlContent = createEmailTemplate(formData);

        const mailOptions = {
            from: '"Briefing System" <contato@agendaproai.com.br>',
            to: 'fernandohdrop@gmail.com', // Email do usuário conforme solicitado
            subject: `Novo Briefing: ${formData.nomeNegocio} - ${new Date().toLocaleDateString('pt-BR')}`,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);

        res.status(200).json({ message: 'Email enviado com sucesso!', messageId: info.messageId });
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        res.status(500).json({ message: 'Erro ao enviar email', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
