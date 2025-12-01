// Основной файл игры

const SCREEN_WIDTH = 1200;
const SCREEN_HEIGHT = 700;
const GAME_AREA_WIDTH = 900;
const PANEL_WIDTH = 300;
const FPS = 60;

const GameState = {
    PLAYING: "playing",
    WIN: "win",
    LOSE: "lose"
};

class Agent {
    constructor() {
        this.abilities = {
            basic_repair: true,
            enhanced_connections: false,
            firewall: false,
            data_redirect: false,
            neural_override: false,
            antivirus: false
        };
        this.energyCapacity = 100;
        this.connectionCostMultiplier = 1.0;
    }
    
    unlockAbility(abilityName) {
        if (this.abilities.hasOwnProperty(abilityName)) {
            this.abilities[abilityName] = true;
        }
    }
    
    canUseEnhancedConnections() {
        return this.abilities.enhanced_connections;
    }
    
    canUseAntivirus() {
        return this.abilities.antivirus;
    }
    
    getConnectionCost(connectionType) {
        const costs = {
            normal: 20,
            enhanced: 40,
            temporary: 15,
            firewall: 30
        };
        const baseCost = costs[connectionType] || 20;
        return Math.floor(baseCost * this.connectionCostMultiplier);
    }
}

class ConnectionManager {
    constructor() {
        this.connections = [];
    }
    
    connectionExists(node1, node2) {
        return this.connections.some(conn => 
            (conn.node1 === node1 && conn.node2 === node2) ||
            (conn.node1 === node2 && conn.node2 === node1)
        );
    }
    
    createConnection(node1, node2, connectionType, agent, playerEnergy, maxLength = 250, duration = null) {
        const distance = Math.sqrt((node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2);
        if (distance > maxLength) {
            return {energy: playerEnergy, message: `Слишком длинная связь! Макс: ${maxLength}px`};
        }
        
        if ((node1.type === "start" && node2.type === "finish") ||
            (node1.type === "finish" && node2.type === "start")) {
            return {energy: playerEnergy, message: "Нельзя соединять старт и финиш напрямую!"};
        }
        
        let finalType = connectionType;
        if (node1.type === "firewall" || node2.type === "firewall") {
            if (connectionType === "normal") {
                finalType = "firewall";
            }
        }
        
        let costMultiplier = 1.0;
        if (node1.type === "amplifier" || node2.type === "amplifier") {
            costMultiplier = 0.7;
        }
        
        const cost = Math.floor(agent.getConnectionCost(finalType) * costMultiplier);
        
        if (playerEnergy >= cost && !this.connectionExists(node1, node2)) {
            this.connections.push(new Connection(node1, node2, finalType, duration));
            return {energy: playerEnergy - cost, message: "Связь создана!"};
        }
        
        return {energy: playerEnergy, message: "Недостаточно энергии или связь уже существует"};
    }
    
    updateConnections(dt) {
        for (let i = this.connections.length - 1; i >= 0; i--) {
            this.connections[i].update(dt);
            if (this.connections[i].isExpired()) {
                this.connections.splice(i, 1);
            }
        }
    }
    
    checkConnection(start, finish) {
        const visited = new Set();
        return this.dfsConnection(start, finish, visited);
    }
    
    dfsConnection(current, finish, visited) {
        if (current === finish) return true;
        if (current.type === "virus" || visited.has(current)) return false;
        
        visited.add(current);
        
        for (const connection of this.connections) {
            if (connection.isExpired()) continue;
            const node1 = connection.node1;
            const node2 = connection.node2;
            
            if (node1 === current && !visited.has(node2)) {
                if (this.dfsConnection(node2, finish, visited)) return true;
            } else if (node2 === current && !visited.has(node1)) {
                if (this.dfsConnection(node1, finish, visited)) return true;
            }
        }
        
        return false;
    }
    
    findAllPaths(start, finish) {
        const paths = [];
        const visited = new Set();
        this.dfsAllPaths(start, finish, visited, [], paths);
        return paths;
    }
    
    dfsAllPaths(current, finish, visited, path, allPaths) {
        if (current === finish) {
            allPaths.push([...path]);
            return;
        }
        
        if (current.type === "virus" || visited.has(current)) return;
        
        visited.add(current);
        path.push(current);
        
        for (const connection of this.connections) {
            if (connection.isExpired()) continue;
            const node1 = connection.node1;
            const node2 = connection.node2;
            
            if (node1 === current && !visited.has(node2)) {
                this.dfsAllPaths(node2, finish, visited, path, allPaths);
            } else if (node2 === current && !visited.has(node1)) {
                this.dfsAllPaths(node1, finish, visited, path, allPaths);
            }
        }
        
        path.pop();
        visited.delete(current);
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.agent = new Agent();
        this.silence = new Silence();
        this.connectionManager = new ConnectionManager();
        
        this.enhancedMode = false;
        this.selectedNode = null;
        this.hoverNode = null;
        this.gameState = GameState.PLAYING;
        this.starsEarned = 0;
        this.destructionEffects = [];
        
        this.levelTime = 0;
        this.timeLeft = 0;
        this.levelStartTime = 0;
        
        this.currentLevel = 1;
        this.nodes = [];
        this.viruses = [];
        this.playerEnergy = 0;
        this.levelConfig = null;
        
        this.lastTime = performance.now();
        this.loadingScreen = document.getElementById('loadingScreen');
        
        // Кнопки
        this.restartButton = document.getElementById('restartButton');
        this.nextLevelButton = document.getElementById('nextLevelButton');
        this.enhancedButton = document.getElementById('enhancedButton');
        
        this.loadLevel(1);
        this.setupEventListeners();
        this.setupButtons();
        this.hideLoadingScreen();
        this.gameLoop();
    }
    
    hideLoadingScreen() {
        setTimeout(() => {
            if (this.loadingScreen) {
                this.loadingScreen.style.display = 'none';
            }
        }, 500);
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Обработка клавиатуры - используем несколько способов для надежности
        const keyHandler = (e) => this.handleKeyDown(e);
        document.addEventListener('keydown', keyHandler);
        window.addEventListener('keydown', keyHandler);
        this.canvas.addEventListener('keydown', keyHandler);
        
        // Убеждаемся, что canvas может получать фокус для клавиатуры
        this.canvas.setAttribute('tabindex', '0');
        this.canvas.style.outline = 'none';
        
        // Автоматически фокусируем canvas при клике
        this.canvas.addEventListener('click', () => {
            this.canvas.focus();
        });
        
        // Фокус при загрузке
        if (document.readyState === 'complete') {
            setTimeout(() => this.canvas.focus(), 100);
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => this.canvas.focus(), 100);
            });
        }
    }
    
    setupButtons() {
        // Кнопка перезапуска
        this.restartButton.addEventListener('click', () => {
            this.loadLevel(this.currentLevel);
        });
        
        // Кнопка следующего уровня
        this.nextLevelButton.addEventListener('click', () => {
            if (this.gameState === GameState.WIN) {
                this.currentLevel = Math.min(10, this.currentLevel + 1);
                this.loadLevel(this.currentLevel);
            }
        });
        
        // Кнопка усиленных связей
        this.enhancedButton.addEventListener('click', () => {
            if (this.agent.canUseEnhancedConnections()) {
                this.enhancedMode = !this.enhancedMode;
                this.updateEnhancedButton();
            }
        });
    }
    
    updateEnhancedButton() {
        if (this.agent.canUseEnhancedConnections()) {
            this.enhancedButton.style.display = 'block';
            if (this.enhancedMode) {
                this.enhancedButton.textContent = '⚡ Усиленные ВКЛ (E)';
                this.enhancedButton.style.background = 'rgba(0, 200, 255, 0.4)';
            } else {
                this.enhancedButton.textContent = '⚡ Усиленные ВЫКЛ (E)';
                this.enhancedButton.style.background = 'rgba(0, 200, 200, 0.2)';
            }
        } else {
            this.enhancedButton.style.display = 'none';
        }
    }
    
    handleMouseDown(e) {
        if (this.gameState !== GameState.PLAYING) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x < GAME_AREA_WIDTH) {
            this.handleClick({x, y});
        }
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x < GAME_AREA_WIDTH) {
            this.handleHover({x, y});
        } else {
            this.hoverNode = null;
        }
    }
    
    handleKeyDown(e) {
        // Игнорируем, если пользователь вводит текст в поле ввода
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        const key = e.key.toLowerCase();
        
        // R - перезапуск уровня (всегда работает)
        if (key === 'r' || key === 'к' || e.keyCode === 82) {
            e.preventDefault();
            e.stopPropagation();
            this.loadLevel(this.currentLevel);
            return false;
        }
        
        // N - следующий уровень (только после победы)
        if (key === 'n' || key === 'т' || e.keyCode === 78) {
            if (this.gameState === GameState.WIN) {
                e.preventDefault();
                e.stopPropagation();
                const nextLevel = Math.min(10, this.currentLevel + 1);
                this.currentLevel = nextLevel;
                this.loadLevel(this.currentLevel);
            }
            return false;
        }
        
        // E - переключение режима усиленных связей
        if ((key === 'e' || key === 'у' || e.keyCode === 69) && this.agent.canUseEnhancedConnections()) {
            e.preventDefault();
            e.stopPropagation();
            this.enhancedMode = !this.enhancedMode;
            this.updateEnhancedButton();
            return false;
        }
    }
    
    handleHover(pos) {
        this.hoverNode = null;
        for (const node of this.nodes) {
            if (node.isClicked(pos)) {
                this.hoverNode = node;
                break;
            }
        }
    }
    
    handleClick(pos) {
        for (const node of this.nodes) {
            if (node.isClicked(pos)) {
                if (node.type === "virus") {
                    if (this.destroyVirus(node)) {
                        if (this.selectedNode) {
                            this.selectedNode.selected = false;
                            this.selectedNode = null;
                        }
                    }
                    return;
                }
                
                if (this.selectedNode === null) {
                    this.selectedNode = node;
                    node.selected = true;
                } else {
                    if (node !== this.selectedNode) {
                        this.createConnection(this.selectedNode, node);
                    }
                    this.selectedNode.selected = false;
                    this.selectedNode = null;
                }
                break;
            }
        }
    }
    
    createConnection(node1, node2) {
        if (node1.type === "virus" || node2.type === "virus") return;
        
        let connectionType = "enhanced";
        let duration = null;
        
        if (this.levelConfig.temporary_connections) {
            connectionType = "temporary";
            duration = this.levelConfig.temporary_duration || 10.0;
        } else {
            connectionType = this.enhancedMode ? "enhanced" : "normal";
        }
        
        const maxLength = this.levelConfig.max_connection_length || 250;
        const result = this.connectionManager.createConnection(
            node1, node2, connectionType, this.agent, this.playerEnergy, maxLength, duration
        );
        
        if (result.energy !== this.playerEnergy) {
            this.playerEnergy = result.energy;
        }
    }
    
    destroyVirus(virusNode) {
        if (this.isIsolated(virusNode)) {
            const virusIndex = this.viruses.findIndex(v => v.node === virusNode);
            if (virusIndex > -1) {
                this.viruses.splice(virusIndex, 1);
            }
            virusNode.type = "neutral";
            this.createVirusDestructionEffect(virusNode);
            return true;
        }
        
        if (this.agent.canUseAntivirus() && this.playerEnergy >= 50) {
            const virusIndex = this.viruses.findIndex(v => v.node === virusNode);
            if (virusIndex > -1) {
                this.viruses.splice(virusIndex, 1);
            }
            virusNode.type = "neutral";
            this.playerEnergy -= 50;
            this.createVirusDestructionEffect(virusNode);
            return true;
        }
        
        return false;
    }
    
    isIsolated(node) {
        const startNode = this.nodes.find(n => n.type === "start");
        if (!startNode) return true;
        
        let hasConnections = false;
        for (const connection of this.connectionManager.connections) {
            if (connection.isExpired()) continue;
            if ((connection.node1 === node && connection.node2 !== node) ||
                (connection.node2 === node && connection.node1 !== node)) {
                hasConnections = true;
                break;
            }
        }
        
        if (hasConnections) {
            return !this.connectionManager.checkConnection(startNode, node);
        } else {
            return true;
        }
    }
    
    createVirusDestructionEffect(node) {
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            this.destructionEffects.push({
                x: node.x,
                y: node.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: [255, 200, 0],
                size: 3 + Math.random() * 3,
                life: 1.0,
                maxLife: 1.0
            });
        }
    }
    
    checkVictory() {
        const startNode = this.nodes.find(n => n.type === "start");
        const finishNode = this.nodes.find(n => n.type === "finish");
        
        if (!startNode || !finishNode) return false;
        
        return this.connectionManager.checkConnection(startNode, finishNode);
    }
    
    calculateStars() {
        let stars = 0;
        
        if (this.checkVictory()) {
            stars += 1;
        }
        
        if (this.levelConfig.time_limit > 0) {
            const timeBonus = this.levelConfig.time_bonus || 0.7;
            if (this.timeLeft / this.levelTime >= timeBonus) {
                stars += 1;
            }
        }
        
        const energyBonus = this.levelConfig.energy_bonus || 0.3;
        const initialEnergy = this.levelConfig.start_energy;
        if (this.playerEnergy / initialEnergy >= energyBonus) {
            stars += 1;
        }
        
        if (this.levelConfig.max_connections) {
            if (this.connectionManager.connections.length <= this.levelConfig.max_connections) {
                stars += 1;
            }
        }
        
        const startNode = this.nodes.find(n => n.type === "start");
        const finishNode = this.nodes.find(n => n.type === "finish");
        if (startNode && finishNode) {
            const paths = this.connectionManager.findAllPaths(startNode, finishNode);
            if (paths.length >= 2) {
                stars += 1;
            }
        }
        
        return Math.min(stars, 5);
    }
    
    loadLevel(levelNum) {
        this.levelConfig = getLevel(levelNum);
        this.currentLevel = levelNum;
        
        this.nodes = [];
        for (const nodeData of this.levelConfig.nodes) {
            this.nodes.push(new Node(nodeData.x, nodeData.y, nodeData.type));
        }
        
        this.playerEnergy = this.levelConfig.start_energy;
        this.connectionManager.connections = [];
        this.viruses = [];
        
        for (const node of this.nodes) {
            if (node.type === "virus") {
                this.viruses.push(new Virus(node));
            }
        }
        
        this.levelName = this.levelConfig.name || `Уровень ${levelNum}`;
        this.levelDescription = this.levelConfig.description || "";
        
        this.levelTime = this.levelConfig.time_limit || 0;
        this.timeLeft = this.levelTime;
        this.levelStartTime = Date.now();
        
        if (this.levelConfig.waves) {
            this.silence.speed = this.levelConfig.silence_speed || 0.001;
            this.silence.waveInterval = this.levelConfig.wave_interval || 30000;
        } else {
            this.silence.speed = 0;
        }
        
        this.silence.reset();
        
        if (levelNum >= 4) {
            this.agent.unlockAbility("enhanced_connections");
        }
        if (levelNum >= 6) {
            this.agent.unlockAbility("antivirus");
        }
        
        this.selectedNode = null;
        this.hoverNode = null;
        this.gameState = GameState.PLAYING;
        this.destructionEffects = [];
        
        // Обновляем видимость кнопок
        this.nextLevelButton.style.display = 'none';
        this.updateEnhancedButton();
    }
    
    update(dt) {
        if (this.gameState === GameState.PLAYING) {
            if (this.levelTime > 0) {
                this.timeLeft -= dt / 1000.0;
                if (this.timeLeft <= 0) {
                    this.gameState = GameState.LOSE;
                    this.nextLevelButton.style.display = 'none';
                    return;
                }
            }
            
            for (const node of this.nodes) {
                node.update(dt);
            }
            
            this.connectionManager.updateConnections(dt);
            
            for (let i = this.destructionEffects.length - 1; i >= 0; i--) {
                const effect = this.destructionEffects[i];
                effect.life -= dt / 1000.0 * 2;
                effect.x += effect.vx * dt / 16.0;
                effect.y += effect.vy * dt / 16.0;
                effect.size *= 0.98;
                if (effect.life <= 0) {
                    this.destructionEffects.splice(i, 1);
                }
            }
            
            this.silence.update(this.connectionManager.connections, this.nodes, dt);
            
            for (let i = this.viruses.length - 1; i >= 0; i--) {
                const virus = this.viruses[i];
                if (virus.node.type !== "virus") {
                    this.viruses.splice(i, 1);
                    continue;
                }
                virus.update(this.nodes, this.connectionManager.connections, dt);
            }
            
            const startNode = this.nodes.find(n => n.type === "start");
            if (startNode && startNode.type === "virus") {
                this.gameState = GameState.LOSE;
                this.nextLevelButton.style.display = 'none';
            }
            
            if (this.checkVictory()) {
                this.gameState = GameState.WIN;
                this.starsEarned = this.calculateStars();
                this.nextLevelButton.style.display = 'block';
                console.log('Победа! Нажмите N или кнопку для следующего уровня');
            }
        }
    }
    
    draw() {
        this.ctx.fillStyle = "#0a0a1e";
        this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        
        // Игровая область
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(0, 0, GAME_AREA_WIDTH, SCREEN_HEIGHT);
        this.ctx.clip();
        
        this.silence.draw(this.ctx, GAME_AREA_WIDTH, SCREEN_HEIGHT);
        
        for (const connection of this.connectionManager.connections) {
            connection.draw(this.ctx);
        }
        
        if (this.selectedNode && this.hoverNode && this.hoverNode !== this.selectedNode) {
            if (this.hoverNode.type !== "virus") {
                const cost = this.agent.getConnectionCost(this.enhancedMode ? "enhanced" : "normal");
                const canAfford = this.playerEnergy >= cost;
                const color = canAfford ? "rgba(0, 255, 0, 0.6)" : "rgba(255, 100, 100, 0.3)";
                
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(this.selectedNode.x, this.selectedNode.y);
                this.ctx.lineTo(this.hoverNode.x, this.hoverNode.y);
                this.ctx.stroke();
            }
        }
        
        for (const node of this.nodes) {
            node.draw(this.ctx);
        }
        
        for (const virus of this.viruses) {
            virus.draw(this.ctx);
        }
        
        for (const effect of this.destructionEffects) {
            const alpha = effect.life / effect.maxLife;
            this.ctx.fillStyle = `rgba(${effect.color[0]}, ${effect.color[1]}, ${effect.color[2]}, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
        
        // UI панель
        this.drawPanel();
        
        // Сообщения о состоянии
        if (this.gameState !== GameState.PLAYING) {
            this.drawGameStateMessage();
        }
    }
    
    drawPanel() {
        const panelX = GAME_AREA_WIDTH;
        let yOffset = 15;
        
        // Фон панели
        this.ctx.fillStyle = "#0a0a19";
        this.ctx.fillRect(panelX, 0, PANEL_WIDTH, SCREEN_HEIGHT);
        
        // Граница
        this.ctx.strokeStyle = "#009696";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(panelX, 0);
        this.ctx.lineTo(panelX, SCREEN_HEIGHT);
        this.ctx.stroke();
        
        // Название уровня
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "24px Arial";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "top";
        this.ctx.fillText(this.levelName, panelX + 10, yOffset);
        yOffset += 30;
        
        // Описание
        const descLines = this.levelDescription.split('\n').slice(0, 5);
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "#c8c8c8";
        for (const line of descLines) {
            this.ctx.fillText(line, panelX + 10, yOffset);
            yOffset += 14;
        }
        yOffset += 15;
        
        // Разделитель
        this.drawSeparator(panelX, yOffset);
        yOffset += 15;
        
        // Статистика
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText(`Уровень: ${this.currentLevel}/10`, panelX + 10, yOffset);
        yOffset += 22;
        
        const energyColor = this.playerEnergy > 40 ? "#ffffff" : (this.playerEnergy > 20 ? "#ffc800" : "#ff6464");
        this.ctx.fillStyle = energyColor;
        this.ctx.fillText(`Энергия: ${this.playerEnergy}`, panelX + 10, yOffset);
        yOffset += 22;
        
        if (this.levelTime > 0) {
            const timeColor = this.timeLeft > 30 ? "#ffffff" : (this.timeLeft > 10 ? "#ffc800" : "#ff6464");
            this.ctx.fillStyle = timeColor;
            this.ctx.fillText(`Время: ${Math.floor(this.timeLeft)}с`, panelX + 10, yOffset);
            yOffset += 25;
        }
        
        // Разделитель
        this.drawSeparator(panelX, yOffset);
        yOffset += 15;
        
        // Способности
        this.ctx.fillStyle = "#64ff64";
        this.ctx.fillText("Способности:", panelX + 10, yOffset);
        yOffset += 22;
        
        if (this.agent.abilities.enhanced_connections) {
            this.ctx.font = "16px Arial";
            if (this.enhancedMode) {
                const pulse = Math.abs((Date.now() % 500) - 250) / 250.0;
                this.ctx.fillStyle = `rgba(${Math.floor(200 * pulse)}, 200, 255, 1)`;
                this.ctx.fillText("Режим: УСИЛЕННЫЕ [E]", panelX + 10, yOffset);
            } else {
                this.ctx.fillStyle = "#00ff00";
                this.ctx.fillText("Режим: ОБЫЧНЫЕ [E]", panelX + 10, yOffset);
            }
            yOffset += 18;
        }
        
        if (this.agent.abilities.antivirus) {
            this.ctx.fillStyle = "#ff6464";
            this.ctx.fillText("Антивирус: 50 энергии", panelX + 10, yOffset);
            yOffset += 18;
        }
        
        // Разделитель
        this.drawSeparator(panelX, yOffset);
        yOffset += 15;
        
        // Легенда
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText("Легенда:", panelX + 10, yOffset);
        yOffset += 22;
        
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "#c8c8c8";
        const legend = [
            ["🟢", "Старт"],
            ["🔵", "Финиш"],
            ["⚪", "Нейтральный"],
            ["🔴", "Вирус"],
            ["🛡️", "Firewall"],
            ["⚡", "Amplifier"]
        ];
        
        for (let i = 0; i < legend.length; i++) {
            const x = i < 3 ? panelX + 10 : panelX + 150;
            const y = yOffset + (i < 3 ? i : i - 3) * 16;
            this.ctx.fillText(`${legend[i][0]} ${legend[i][1]}`, x, y);
        }
        yOffset += 48;
        
        // Разделитель
        this.drawSeparator(panelX, yOffset);
        yOffset += 15;
        
        // Стоимость
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText("Стоимость:", panelX + 10, yOffset);
        yOffset += 22;
        
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "#c8c8c8";
        const costs = [
            ["🔗 Обычная", "20"],
            ["💎 Усиленная", "40"],
            ["⏱️ Временная", "15"]
        ];
        
        for (let i = 0; i < costs.length; i++) {
            const x = i < 2 ? panelX + 10 : panelX + 150;
            const y = yOffset + (i < 2 ? i : i - 2) * 16;
            this.ctx.fillText(`${costs[i][0]}: ${costs[i][1]}`, x, y);
        }
        yOffset += 48;
        
        // Управление
        const controls = [
            ["ЛКМ", "Создать связь"],
            ["ПКМ по вирусу", "Уничтожить"],
            ["E", "Усиленные связи"],
            ["R", "Перезапуск"],
            ["N", "Следующий уровень"]
        ];
        
        const controlsY = SCREEN_HEIGHT - controls.length * 20 - 10;
        this.ctx.font = "16px Arial";
        for (let i = 0; i < controls.length; i++) {
            this.ctx.fillStyle = "#00ffff";
            this.ctx.fillText(controls[i][0], panelX + 10, controlsY + i * 16);
            this.ctx.fillStyle = "#c8c8c8";
            this.ctx.fillText(controls[i][1], panelX + 80, controlsY + i * 16);
        }
    }
    
    drawSeparator(x, y) {
        this.ctx.strokeStyle = "#323246";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 10, y);
        this.ctx.lineTo(x + 290, y);
        this.ctx.stroke();
    }
    
    drawGameStateMessage() {
        // Затемнение
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        this.ctx.fillRect(0, 0, GAME_AREA_WIDTH, SCREEN_HEIGHT);
        
        if (this.gameState === GameState.WIN) {
            this.ctx.fillStyle = "#00ff00";
            this.ctx.font = "32px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText("УРОВЕНЬ ПРОЙДЕН!", GAME_AREA_WIDTH / 2, SCREEN_HEIGHT / 2 - 80);
            
            this.ctx.fillStyle = "#ffd700";
            this.ctx.font = "20px Arial";
            this.ctx.fillText(`Звёзд: ${this.starsEarned}/5`, GAME_AREA_WIDTH / 2, SCREEN_HEIGHT / 2 - 30);
            
            this.ctx.fillStyle = "#c8ffc8";
            this.ctx.fillText("N - следующий уровень", GAME_AREA_WIDTH / 2, SCREEN_HEIGHT / 2 + 20);
        } else if (this.gameState === GameState.LOSE) {
            const loseText = this.timeLeft <= 0 ? "ВРЕМЯ ВЫШЛО!" : "СИСТЕМА ЗАРАЖЕНА!";
            this.ctx.fillStyle = "#ff0000";
            this.ctx.font = "32px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(loseText, GAME_AREA_WIDTH / 2, SCREEN_HEIGHT / 2 - 20);
            
            this.ctx.fillStyle = "#ffc8c8";
            this.ctx.font = "20px Arial";
            this.ctx.fillText("R - перезапуск", GAME_AREA_WIDTH / 2, SCREEN_HEIGHT / 2 + 20);
        }
    }
    
    gameLoop() {
        const currentTime = performance.now();
        const dt = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(dt);
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Запуск игры после загрузки страницы
window.addEventListener('load', () => {
    new Game();
});

