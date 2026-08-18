# 🍕 Pizzeria Bella Notte (Insta Livre Pizza)

Aplicativo web completo, cinematográfico e pronto para produção de uma pizzaria artesanal italiana, cobrindo toda a jornada do cliente, display da cozinha (KDS), rastreamento ao vivo do motoboy por GPS e relatórios gerenciais reais.

---

## 🌟 Principais Destaques & Funcionalidades

1. **Hero Cinematográfico (GSAP + ScrollTrigger)**:
   - Sequência com animação de massa elástica, fatias de tomates frescos caindo em paralaxe 3D, folhas de orégano/manjericão flutuando e queijo mussarela derretido com estiramento.
   - Pinned ScrollTrigger multi-camadas e suporte a `prefers-reduced-motion: reduce`.
2. **App do Cliente**:
   - Cardápio interativo e dinâmico por categorias (Tradicionais, Especiais, Doces, Bebidas).
   - **Monte sua Pizza & Meio a Meio**: Canvas visual em camadas que reflete os ingredientes e metades escolhidos em tempo real.
   - Carrinho persistente (`localStorage`), cálculo de frete por distância e cupons de desconto (`BEMVINDO10`, `BELLA15`).
   - Checkout completo com **PIX Instantâneo (Payload EMV padrão BR Code + QR Code real)** e Cartão de Crédito com validação de algoritmo de Luhn.
   - **Rastreamento de Pedido em Tempo Real**: Linha do tempo com status dinâmico e **Mapa Leaflet ao Vivo** com o motoboy se deslocando em tempo real via WebSockets.
   - Sistema de avaliação pós-entrega com notas e comentários persistidos no banco de dados.
3. **Painel da Cozinha (KDS - Kitchen Display System)**:
   - Fila de pedidos ao vivo via WebSocket organizada por status (*Novos Recebidos*, *Na Bancada*, *No Forno*, *Prontos para Retirada*).
   - SLA timers com alerta visual de tempo decorrido (verde < 15m, amarelo < 30m, vermelho > 30m) e alarme sonoro Web Audio API para novas comandas.
   - Atribuição de motoboy com 1 clique.
4. **Painel do Motoboy**:
   - Lista de entregas ativadas, endereço, cobrança de dinheiro na entrega.
   - Transmissão de coordenadas GPS em tempo real via WebSocket (com simulador contínuo de rota ao vivo pela Av. Paulista/Bela Vista).
5. **Painel Administrativo & Relatórios**:
   - Métricas reais de faturamento, volume de pedidos, tempo médio de entrega e satisfação do cliente calculadas diretamente das queries do banco de dados (SQLite/Prisma).
   - Gerenciador CRUD de produtos e categorias do cardápio.
   - Auditoria completa de pedidos com histórico de transições.
6. **Design System**:
   - Paleta italiana clássica e moderna (*Rosso Pomodoro*, *Oro Forno*, *Verde Basilico*, *Legno Notte*, *Farina 00*).
   - Tipografia editorial (`Cinzel` e `Inter`) com contraste AA.

---

## 🛠️ Arquitetura Técnica

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + GSAP 3 + ScrollTrigger + Leaflet + Lucide Icons + Zustand.
- **Backend**: Node.js + Express + TypeScript + Socket.IO + Prisma ORM + SQLite + bcryptjs + jsonwebtoken + Zod.
- **Testes**: Vitest cobrindo regras de precificação, cálculo de meio a meio, cupons e máquina de estados de pedidos.

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- Node.js 18+ instalado.

### 2. Instalação e Setup do Banco de Dados
Na raiz do projeto (`instalivre-pizza`):

```bash
# Instalar dependências e preparar o banco SQLite + seed inicial
npm run setup
```

Ou manualmente por pastas:

```bash
# Backend:
cd backend
npm install
npx prisma db push
npm run prisma:seed

# Frontend:
cd ../frontend
npm install
```

### 3. Iniciar os Servidores

Em um terminal (Backend):
```bash
cd backend
npm run dev
# Servidor rodará em: http://localhost:4000
```

Em outro terminal (Frontend):
```bash
cd frontend
npm run dev
# App web abrirá em: http://localhost:5173
```

### 4. Executar os Testes Automatizados
```bash
cd backend
npm test
```

---

## 🔑 Credenciais de Demonstração (Seed)

O aplicativo conta com troca rápida de perfil pelo topo da página, ou você pode logar com:

| Papel | E-mail | Senha |
| :--- | :--- | :--- |
| **Cliente** | `cliente@bellanotte.com` | `bella123` |
| **Cozinha (KDS)** | `cozinha@bellanotte.com` | `bella123` |
| **Motoboy** | `motoboy@bellanotte.com` | `bella123` |
| **Administrador** | `admin@bellanotte.com` | `bella123` |

---

## 📋 Transparência & Integridade (Regras Anti-Alucinação)

1. **O que é 100% real e funcional:**
   - Toda a persistência em banco de dados SQLite com Prisma ORM.
   - Sockets bidirecionais entre Cliente, Cozinha e Motoboy via Socket.IO.
   - Cálculos reais de regras de meio a meio (maior valor), bordas e adicionais.
   - Rastreamento e movimentação de motoboy com coordenadas GPS reais transmitidas por WebSockets.
   - Relatórios administrativos e médias de avaliação alimentados por queries SQL reais.
2. **O que opera em modo Sandbox / Simulado de alta fidelidade:**
   - **Gateway de Pagamento**: O pagamento com Cartão valida número (Luhn Check), validade e CVV gerando código de autorização real local. O PIX gera código padrão EMV BR Code real com chave fictícia e QR Code escaneável.
   - **Geocoding de Endereço**: As coordenadas são centradas na região central de São Paulo (Bela Vista / Av. Paulista) com roteamento real no OpenStreetMap/Leaflet.
