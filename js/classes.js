// Классы игры

class Node {
    constructor(x, y, type = "neutral") {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.type = type;
        this.selected = false;
        this.pulse = 0.0;
        this.animationTime = 0.0;
    }
    
    update(dt) {
        this.pulse = (this.pulse + dt / 1000.0) % 1.0;
        this.animationTime += dt / 1000.0;
    }
    
    draw(ctx) {
        switch(this.type) {
            case "start":
                this.drawNeuralCore(ctx);
                break;
            case "finish":
                this.drawDataHub(ctx);
                break;
            case "virus":
                this.drawCorruptedNode(ctx);
                break;
            case "firewall":
                this.drawShieldNode(ctx);
                break;
            case "amplifier":
                this.drawAmplifierNode(ctx);
                break;
            default:
                this.drawNeutralNode(ctx);
        }
        
        if (this.selected) {
            ctx.strokeStyle = `rgba(255, 255, 0, 0.8)`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    drawNeuralCore(ctx) {
        const baseColor = "#00ffff";
        const pulse = (Math.sin(this.animationTime * 3) + 1) / 2;
        
        // Внешние кольца
        for (let i = 0; i < 8; i++) {
            const angle = this.animationTime * 2 + i * Math.PI / 4;
            const radiusOffset = 25 + Math.sin(this.animationTime * 3 + i) * 5;
            const x = this.x + Math.cos(angle) * radiusOffset;
            const y = this.y + Math.sin(angle) * radiusOffset;
            
            ctx.fillStyle = `rgba(0, 255, 255, ${0.4 + 0.6 * pulse})`;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Многослойное свечение
        for (let i = 4; i > 0; i--) {
            const glowRadius = this.radius + i * 4;
            const alpha = (0.2 + 0.4 * pulse) / (i + 1);
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Основное ядро
        const coreRadius = this.radius + 3 * pulse;
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, coreRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Внутренняя структура
        for (let i = 0; i < 3; i++) {
            const angle = this.animationTime * 2 + i * 2 * Math.PI / 3;
            const innerX = this.x + Math.cos(angle) * (coreRadius * 0.5);
            const innerY = this.y + Math.sin(angle) * (coreRadius * 0.5);
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(innerX, innerY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawDataHub(ctx) {
        const baseColor = "#0064ff";
        
        // Вращающиеся кольца
        for (let ring = 0; ring < 3; ring++) {
            const ringRadius = this.radius + 8 + ring * 6;
            const rotation = this.animationTime * (1 + ring * 0.5);
            
            for (let i = 0; i < 8; i++) {
                const angle1 = rotation + i * Math.PI / 4;
                const angle2 = rotation + (i + 0.7) * Math.PI / 4;
                
                const x1 = this.x + Math.cos(angle1) * ringRadius;
                const y1 = this.y + Math.sin(angle1) * ringRadius;
                const x2 = this.x + Math.cos(angle2) * ringRadius;
                const y2 = this.y + Math.sin(angle2) * ringRadius;
                
                ctx.strokeStyle = baseColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }
        
        // Центральный хаб
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#c8c8ff";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius - 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Свечение
        const pulse = (Math.sin(this.animationTime * 2) + 1) / 2;
        for (let i = 0; i < 2; i++) {
            const glowRadius = this.radius + 5 + i * 3;
            const alpha = (0.3 + 0.4 * pulse) / (i + 1);
            ctx.strokeStyle = `rgba(0, 100, 255, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    drawCorruptedNode(ctx) {
        const baseColor = "#ff0000";
        const distortion = Math.sin(this.animationTime * 4) * 0.3;
        
        // Искаженная форма
        const points = [];
        for (let i = 0; i < 8; i++) {
            const angle = i * 2 * Math.PI / 8 + this.animationTime;
            const radiusVar = this.radius * (1 + distortion * Math.sin(angle * 3));
            const x = this.x + Math.cos(angle) * radiusVar;
            const y = this.y + Math.sin(angle) * radiusVar;
            points.push({x, y});
        }
        
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        
        // Внутренние шипы
        for (let i = 0; i < 6; i++) {
            const angle = this.animationTime * 2 + i * Math.PI / 3;
            const spikeLength = 8 + Math.sin(this.animationTime * 5 + i) * 3;
            const x1 = this.x + Math.cos(angle) * (this.radius - 5);
            const y1 = this.y + Math.sin(angle) * (this.radius - 5);
            const x2 = this.x + Math.cos(angle) * (this.radius + spikeLength);
            const y2 = this.y + Math.sin(angle) * (this.radius + spikeLength);
            
            ctx.strokeStyle = "#ff9696";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
        // Пульсирующее свечение
        const pulse = (Math.sin(this.animationTime * 5) + 1) / 2;
        for (let i = 0; i < 3; i++) {
            const glowRadius = this.radius + 5 + i * 4 + pulse * 3;
            const alpha = (0.4 + 0.4 * pulse) / (i + 1);
            ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    drawShieldNode(ctx) {
        const baseColor = "#64c8ff";
        
        // Вращающиеся защитные сегменты
        for (let i = 0; i < 6; i++) {
            const angle = this.animationTime + i * Math.PI / 3;
            const x1 = this.x + Math.cos(angle) * this.radius;
            const y1 = this.y + Math.sin(angle) * this.radius;
            const x2 = this.x + Math.cos(angle) * (this.radius + 10);
            const y2 = this.y + Math.sin(angle) * (this.radius + 10);
            
            ctx.strokeStyle = baseColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
        // Центральный узел
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#c8e6ff";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Защитное кольцо
        for (let i = 0; i < 2; i++) {
            const ringRadius = this.radius + 12 + i * 3;
            const alpha = (0.6 - i * 0.2);
            ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    drawAmplifierNode(ctx) {
        const baseColor = "#ffc800";
        
        // Расходящиеся волны
        for (let wave = 0; wave < 3; wave++) {
            const waveRadius = this.radius + 5 + wave * 8 + Math.sin(this.animationTime * 2) * 3;
            const alpha = 0.6 / (wave + 1);
            ctx.strokeStyle = `rgba(255, 200, 0, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Центр
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#ffff96";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Внутренние линии
        for (let i = 0; i < 4; i++) {
            const angle = this.animationTime + i * Math.PI / 2;
            const x = this.x + Math.cos(angle) * (this.radius * 0.6);
            const y = this.y + Math.sin(angle) * (this.radius * 0.6);
            
            ctx.strokeStyle = "#ffffc8";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }
    
    drawNeutralNode(ctx) {
        const baseColor = "#c8c8c8";
        const pulse = (Math.sin(this.animationTime * 2) + 1) / 2;
        
        // Легкое свечение при выделении
        if (this.selected) {
            for (let i = 0; i < 2; i++) {
                const glowRadius = this.radius + 3 + i * 2;
                const alpha = (0.3 + 0.3 * pulse) / (i + 1);
                ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Основной круг
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    isClicked(pos) {
        const distance = Math.sqrt((this.x - pos.x) ** 2 + (this.y - pos.y) ** 2);
        return distance <= this.radius;
    }
}

class Connection {
    constructor(node1, node2, connectionType = "normal", duration = null) {
        this.node1 = node1;
        this.node2 = node2;
        this.type = connectionType;
        this.duration = duration;
        this.createdTime = Date.now();
        this.animationTime = 0.0;
        this.color = this.getColor();
        this.width = connectionType === "normal" ? 3 : 5;
        this.distance = this.calculateDistance();
    }
    
    calculateDistance() {
        return Math.sqrt((this.node1.x - this.node2.x) ** 2 + (this.node1.y - this.node2.y) ** 2);
    }
    
    isExpired() {
        if (this.duration === null) return false;
        return (Date.now() - this.createdTime) / 1000 > this.duration;
    }
    
    getTimeRemaining() {
        if (this.duration === null) return null;
        return Math.max(0, this.duration - (Date.now() - this.createdTime) / 1000);
    }
    
    getColor() {
        const colors = {
            "normal": "#00ff00",
            "enhanced": "#00c8ff",
            "temporary": "#ffc800",
            "firewall": "#64c8ff"
        };
        return colors[this.type] || "#00ff00";
    }
    
    update(dt) {
        this.animationTime += dt / 1000.0;
    }
    
    draw(ctx) {
        if (this.type === "enhanced") {
            this.drawEnhancedConnection(ctx);
        } else if (this.type === "temporary") {
            this.drawTemporaryConnection(ctx);
        } else {
            this.drawNormalConnection(ctx);
        }
    }
    
    drawNormalConnection(ctx) {
        // Свечение
        for (let i = 0; i < 2; i++) {
            const glowWidth = this.width + 2 + i * 2;
            const alpha = (0.2 - i * 0.08);
            ctx.strokeStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            ctx.lineWidth = glowWidth;
            ctx.beginPath();
            ctx.moveTo(this.node1.x, this.node1.y);
            ctx.lineTo(this.node2.x, this.node2.y);
            ctx.stroke();
        }
        
        // Основная линия
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.beginPath();
        ctx.moveTo(this.node1.x, this.node1.y);
        ctx.lineTo(this.node2.x, this.node2.y);
        ctx.stroke();
    }
    
    drawEnhancedConnection(ctx) {
        // Импульсы
        const pulsePos = (this.animationTime * 0.5) % 1.0;
        const pulseX = this.node1.x + (this.node2.x - this.node1.x) * pulsePos;
        const pulseY = this.node1.y + (this.node2.y - this.node1.y) * pulsePos;
        
        // Рисуем импульс
        for (let i = 0; i < 3; i++) {
            const radius = 5 + i * 3;
            const alpha = 0.8 / (i + 1);
            ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Основная линия
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.beginPath();
        ctx.moveTo(this.node1.x, this.node1.y);
        ctx.lineTo(this.node2.x, this.node2.y);
        ctx.stroke();
    }
    
    drawTemporaryConnection(ctx) {
        const timeLeft = this.getTimeRemaining();
        
        // Пунктирная линия
        this.drawDashedLine(ctx);
        
        // Индикатор времени
        if (timeLeft !== null) {
            const midX = (this.node1.x + this.node2.x) / 2;
            const midY = (this.node1.y + this.node2.y) / 2;
            
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.fillRect(midX - 20, midY - 10, 40, 20);
            
            ctx.fillStyle = "#ffffff";
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`${Math.ceil(timeLeft)}s`, midX, midY);
        }
    }
    
    drawDashedLine(ctx) {
        const dx = this.node2.x - this.node1.x;
        const dy = this.node2.y - this.node1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        const dashLength = 10;
        const gapLength = 5;
        const numDashes = Math.floor(distance / (dashLength + gapLength));
        
        const unitX = dx / distance;
        const unitY = dy / distance;
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        
        for (let i = 0; i < numDashes; i++) {
            const startT = i * (dashLength + gapLength) / distance;
            const endT = (i * (dashLength + gapLength) + dashLength) / distance;
            
            const startX = this.node1.x + dx * startT;
            const startY = this.node1.y + dy * startT;
            const endX = this.node1.x + dx * endT;
            const endY = this.node1.y + dy * endT;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    }
}

class Virus {
    constructor(node) {
        this.node = node;
        this.timer = 0;
        this.spreadInterval = 4000 + Math.random() * 4000;
        this.health = 3;
        this.attackTimer = 0;
        this.attackInterval = 10000;
        this.movementTimer = 0;
        this.movementInterval = 15000;
        this.evolutionTimer = 0;
        this.evolutionStage = 1;
    }
    
    update(nodes, connections, dt) {
        this.timer += dt;
        this.attackTimer += dt;
        this.movementTimer += dt;
        this.evolutionTimer += dt;
        
        // Эволюция каждые 45 секунд
        if (this.evolutionTimer >= 45000) {
            this.evolve();
            this.evolutionTimer = 0;
        }
        
        // Распространение
        if (this.timer >= this.spreadInterval) {
            this.timer = 0;
            this.trySpread(nodes, connections);
        }
        
        // Атака на связи
        if (this.attackTimer >= this.attackInterval) {
            this.attackTimer = 0;
            this.attackConnections(connections);
        }
        
        // Движение
        if (this.movementTimer >= this.movementInterval) {
            this.movementTimer = 0;
            this.tryMove(nodes, connections);
        }
    }
    
    evolve() {
        this.evolutionStage += 1;
        this.health = Math.min(5, this.health + 1);
        this.spreadInterval = Math.max(2000, this.spreadInterval - 1000);
    }
    
    trySpread(nodes, connections) {
        const neighbors = [];
        const startNode = nodes.find(n => n.type === "start");
        
        for (const node of nodes) {
            if (node.type === "firewall") continue;
            
            if (node.type === "neutral") {
                for (const connection of connections) {
                    if (connection.isExpired()) continue;
                    if ((connection.node1 === this.node && connection.node2 === node) ||
                        (connection.node2 === this.node && connection.node1 === node)) {
                        
                        // Проверка защиты firewall
                        let isProtected = false;
                        for (const otherNode of nodes) {
                            if (otherNode.type === "firewall") {
                                for (const conn of connections) {
                                    if (conn.isExpired()) continue;
                                    if ((conn.node1 === otherNode && conn.node2 === node) ||
                                        (conn.node2 === otherNode && conn.node1 === node)) {
                                        isProtected = true;
                                        break;
                                    }
                                }
                                if (isProtected) break;
                            }
                        }
                        
                        if (!isProtected) {
                            let priority = 0;
                            if (startNode) {
                                const distanceToStart = Math.sqrt((node.x - startNode.x) ** 2 + (node.y - startNode.y) ** 2);
                                priority = 1.0 / (distanceToStart + 1);
                            }
                            neighbors.push({node, priority});
                        }
                        break;
                    }
                }
            }
        }
        
        if (neighbors.length > 0) {
            const totalPriority = neighbors.reduce((sum, n) => sum + n.priority, 0);
            let randVal = Math.random() * totalPriority;
            let current = 0;
            
            for (const {node, priority} of neighbors) {
                current += priority;
                if (randVal <= current) {
                    node.type = "virus";
                    return true;
                }
            }
        }
        return false;
    }
    
    attackConnections(connections) {
        const targetConnections = [];
        
        for (const connection of connections) {
            if (connection.isExpired()) continue;
            if (connection.node1 === this.node || connection.node2 === this.node) {
                if (connection.type === "enhanced" || connection.type === "firewall") continue;
                const priority = connection.type === "normal" ? 2 : 1;
                for (let i = 0; i < priority; i++) {
                    targetConnections.push(connection);
                }
            }
        }
        
        if (targetConnections.length > 0) {
            const target = targetConnections[Math.floor(Math.random() * targetConnections.length)];
            const index = connections.indexOf(target);
            if (index > -1) {
                connections.splice(index, 1);
            }
        }
    }
    
    tryMove(nodes, connections) {
        const neighbors = [];
        
        for (const node of nodes) {
            if (node.type === "firewall") continue;
            if (node.type === "neutral") {
                for (const connection of connections) {
                    if (connection.isExpired()) continue;
                    if ((connection.node1 === this.node && connection.node2 === node) ||
                        (connection.node2 === this.node && connection.node1 === node)) {
                        neighbors.push(node);
                        break;
                    }
                }
            }
        }
        
        if (neighbors.length > 0) {
            const newNode = neighbors[Math.floor(Math.random() * neighbors.length)];
            this.node.type = "neutral";
            newNode.type = "virus";
            this.node = newNode;
        }
    }
    
    draw(ctx) {
        const pulseSpeed = 0.002 * this.evolutionStage;
        const pulse = (Math.sin(Date.now() * pulseSpeed) + 1) / 2;
        
        const baseRadius = 20 + 5 * this.evolutionStage;
        const radius = baseRadius + 5 * pulse;
        
        // Основной круг
        const colorIntensity = 100 + 155 * pulse;
        ctx.fillStyle = `rgb(255, ${colorIntensity - 100}, ${colorIntensity - 100})`;
        ctx.beginPath();
        ctx.arc(this.node.x, this.node.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Внешнее кольцо
        for (let i = 0; i < 3; i++) {
            const ringRadius = radius + 5 + i * 3;
            const alpha = (0.4 - i * 0.12) / (i + 1);
            ctx.strokeStyle = `rgba(255, 100, 100, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.node.x, this.node.y, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Индикатор эволюции
        for (let i = 0; i < this.evolutionStage; i++) {
            const angle = 2 * Math.PI * i / this.evolutionStage;
            const spikeX = this.node.x + Math.cos(angle) * (radius + 5);
            const spikeY = this.node.y + Math.sin(angle) * (radius + 5);
            ctx.fillStyle = "#ffff00";
            ctx.beginPath();
            ctx.arc(spikeX, spikeY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Индикатор здоровья
        for (let i = 0; i < this.health; i++) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(this.node.x - 15 + i * 8, this.node.y - radius - 10, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class Silence {
    constructor() {
        this.waveTimer = 0;
        this.waveInterval = 30000;
        this.waveActive = false;
        this.waveProgress = 0.0;
        this.nextWaveTime = 0;
        this.reset();
    }
    
    reset() {
        this.waveTimer = 0;
        this.waveActive = false;
        this.waveProgress = 0.0;
        this.nextWaveTime = this.waveInterval;
    }
    
    update(connections, nodes, dt) {
        this.waveTimer += dt;
        
        if (this.waveTimer >= this.nextWaveTime && !this.waveActive) {
            this.startWave();
            this.waveTimer = 0;
            this.nextWaveTime = 25000 + Math.random() * 10000;
        }
        
        if (this.waveActive) {
            this.waveProgress += 0.015;
            
            if (this.waveProgress >= 1.0) {
                this.waveActive = false;
                this.destroyNormalConnections(connections);
                this.waveProgress = 0.0;
            }
        }
    }
    
    startWave() {
        this.waveActive = true;
        this.waveProgress = 0.0;
    }
    
    destroyNormalConnections(connections) {
        for (let i = connections.length - 1; i >= 0; i--) {
            if (connections[i].type === "normal") {
                connections.splice(i, 1);
            }
        }
    }
    
    draw(ctx, width, height) {
        // Полоса прогресса
        const progress = Math.min(1.0, this.waveTimer / this.nextWaveTime);
        const barWidth = width * progress;
        
        // Фон полосы
        ctx.fillStyle = "#320000";
        ctx.fillRect(0, height - 15, width, 15);
        
        // Прогресс
        ctx.fillStyle = "#c80000";
        ctx.fillRect(0, height - 15, barWidth, 15);
        
        // Контур
        ctx.strokeStyle = "#646464";
        ctx.lineWidth = 1;
        ctx.strokeRect(0, height - 15, width, 15);
        
        // Текст
        ctx.fillStyle = "#ffffff";
        ctx.font = "20px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        const timeLeft = Math.floor((this.nextWaveTime - this.waveTimer) / 1000);
        ctx.fillText(`Волна через: ${timeLeft}с`, 10, height - 30);
        
        // Анимация волны
        if (this.waveActive) {
            this.drawWave(ctx, width, height);
        }
    }
    
    drawWave(ctx, width, height) {
        const waveHeight = height * this.waveProgress;
        
        if (waveHeight <= 0) return;
        
        // Градиентная заливка
        for (let y = 0; y < waveHeight; y++) {
            const alpha = 0.6 * (1 - y / waveHeight);
            ctx.fillStyle = `rgba(100, 0, 0, ${alpha})`;
            ctx.fillRect(0, height - waveHeight + y, width, 1);
        }
        
        // Волнистая граница
        ctx.strokeStyle = "rgba(200, 0, 0, 0.8)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < width; x += 5) {
            const waveOffset = Math.sin(x * 0.1 + Date.now() * 0.01) * 10;
            if (x === 0) {
                ctx.moveTo(x, height - waveHeight + waveOffset);
            } else {
                ctx.lineTo(x, height - waveHeight + waveOffset);
            }
        }
        ctx.stroke();
    }
}

