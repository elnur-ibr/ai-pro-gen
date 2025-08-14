import React, { useRef, useEffect, useState } from 'react';

interface ProcessStep {
    processStepId: string;
    processStepDescription: string;
    nextStepIds: string[];
    decisionLabels: string[];
    shapeType: 'Start' | 'Process' | 'Decision' | 'End';
    function: string;
    description: string | null;
}

interface ProcessCanvasProps {
    processSteps: ProcessStep[];
    width?: number;
    height?: number;
    onStepClick?: (stepId: string) => void;
    selectedStepId?: string | null;
}

interface Position {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Connection {
    from: string;
    to: string;
    label?: string;
}

export const ProcessCanvas: React.FC<ProcessCanvasProps> = ({ 
    processSteps, 
    width = 800, 
    height = 600,
    onStepClick,
    selectedStepId
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hoveredStep, setHoveredStep] = useState<string | null>(null);
    const [positions, setPositions] = useState<{ [key: string]: Position }>({});
    const [connections, setConnections] = useState<Connection[]>([]);
    const [zoom, setZoom] = useState(1);
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    // Calculate positions and connections
    useEffect(() => {
        if (processSteps.length === 0) return;

        const newPositions: { [key: string]: Position } = {};
        const newConnections: Connection[] = [];
        
        const shapeWidth = 140;
        const shapeHeight = 80;
        
        // Dynamic layout calculation
        const totalSteps = processSteps.length;
        
        // Calculate optimal grid layout
        let columns = Math.ceil(Math.sqrt(totalSteps));
        let rows = Math.ceil(totalSteps / columns);
        
        // Adjust for better aspect ratio
        if (columns * (rows - 1) >= totalSteps) {
            rows = rows - 1;
        }
        
        // Calculate spacing to fit within canvas with some padding
        const canvasWidth = width - 100; // Leave 50px padding on each side
        const canvasHeight = height - 100; // Leave 50px padding on top/bottom
        
        const horizontalSpacing = Math.max(180, canvasWidth / columns);
        const verticalSpacing = Math.max(100, canvasHeight / rows);
        
        // Position shapes in a more efficient layout
        processSteps.forEach((step, index) => {
            const row = Math.floor(index / columns);
            const col = index % columns;
            
            // Center the layout within the canvas
            const startX = (width - (columns - 1) * horizontalSpacing - shapeWidth) / 2;
            const startY = (height - (rows - 1) * verticalSpacing - shapeHeight) / 2;
            
            newPositions[step.processStepId] = {
                x: startX + col * horizontalSpacing,
                y: startY + row * verticalSpacing,
                width: shapeWidth,
                height: shapeHeight
            };
            
            step.nextStepIds.forEach((nextId, nextIndex) => {
                const label = step.shapeType === 'Decision' && step.decisionLabels[nextIndex] 
                    ? step.decisionLabels[nextIndex] 
                    : undefined;
                newConnections.push({
                    from: step.processStepId,
                    to: nextId,
                    label
                });
            });
        });

        setPositions(newPositions);
        setConnections(newConnections);
    }, [processSteps, width, height]);

    // Drawing functions
    const drawStartShape = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, text: string, func: string, isHovered: boolean, isSelected: boolean) => {
        ctx.save();
        
        // Shadow for depth
        if (isHovered || isSelected) {
            ctx.shadowColor = isSelected ? 'rgba(59, 130, 246, 0.5)' : 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = isSelected ? 12 : 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        }
        
        // Draw ellipse
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? '#dbeafe' : isHovered ? '#f0f9ff' : 'white';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#2563eb' : isHovered ? '#3b82f6' : '#333';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();
        
        ctx.restore();
        
        // Text
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + w/2, y + h/2 - 5);
        
        if (func) {
            ctx.font = '10px Arial';
            ctx.fillStyle = '#666';
            ctx.fillText(`(${func})`, x + w/2, y + h/2 + 10);
        }
    };

    const drawProcessShape = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, text: string, func: string, isHovered: boolean, isSelected: boolean) => {
        ctx.save();
        
        if (isHovered || isSelected) {
            ctx.shadowColor = isSelected ? 'rgba(59, 130, 246, 0.5)' : 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = isSelected ? 12 : 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        }
        
        // Draw rounded rectangle
        const radius = 4;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, radius);
        ctx.fillStyle = isSelected ? '#dbeafe' : isHovered ? '#f0f9ff' : 'white';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#2563eb' : isHovered ? '#3b82f6' : '#333';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();
        
        ctx.restore();
        
        // Text
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + w/2, y + h/2 - 5);
        
        if (func) {
            ctx.font = '10px Arial';
            ctx.fillStyle = '#666';
            ctx.fillText(`(${func})`, x + w/2, y + h/2 + 10);
        }
    };

    const drawDecisionShape = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, text: string, func: string, isHovered: boolean, isSelected: boolean) => {
        ctx.save();
        
        if (isHovered || isSelected) {
            ctx.shadowColor = isSelected ? 'rgba(245, 158, 11, 0.5)' : 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = isSelected ? 12 : 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        }
        
        // Draw diamond
        const centerX = x + w/2;
        const centerY = y + h/2;
        
        ctx.beginPath();
        ctx.moveTo(centerX, y);
        ctx.lineTo(x + w, centerY);
        ctx.lineTo(centerX, y + h);
        ctx.lineTo(x, centerY);
        ctx.closePath();
        
        ctx.fillStyle = isSelected ? '#fde68a' : isHovered ? '#fef3c7' : 'white';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#d97706' : isHovered ? '#f59e0b' : '#333';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();
        
        ctx.restore();
        
        // Text
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, centerX, centerY - 5);
        
        if (func) {
            ctx.font = '10px Arial';
            ctx.fillStyle = '#666';
            ctx.fillText(`(${func})`, centerX, centerY + 10);
        }
    };

    const drawEndShape = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, text: string, func: string, isHovered: boolean, isSelected: boolean) => {
        ctx.save();
        
        if (isHovered || isSelected) {
            ctx.shadowColor = isSelected ? 'rgba(239, 68, 68, 0.5)' : 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = isSelected ? 12 : 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        }
        
        // Draw outer ellipse
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? '#fecaca' : isHovered ? '#fef2f2' : 'white';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#dc2626' : isHovered ? '#ef4444' : '#333';
        ctx.lineWidth = isSelected ? 4 : 3;
        ctx.stroke();
        
        // Draw inner ellipse
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + h/2, w/2 - 5, h/2 - 5, 0, 0, 2 * Math.PI);
        ctx.strokeStyle = isSelected ? '#dc2626' : isHovered ? '#ef4444' : '#333';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();
        
        ctx.restore();
        
        // Text
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + w/2, y + h/2 - 5);
        
        if (func) {
            ctx.font = '10px Arial';
            ctx.fillStyle = '#666';
            ctx.fillText(`(${func})`, x + w/2, y + h/2 + 10);
        }
    };

    const drawArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, label?: string) => {
        const arrowHeadSize = 10;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw arrowhead
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(
            x2 - arrowHeadSize * Math.cos(angle - Math.PI / 6),
            y2 - arrowHeadSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(x2, y2);
        ctx.lineTo(
            x2 - arrowHeadSize * Math.cos(angle + Math.PI / 6),
            y2 - arrowHeadSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        
        // Draw label if provided
        if (label) {
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            
            // Label background
            ctx.fillStyle = 'white';
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            const labelWidth = 30;
            const labelHeight = 16;
            ctx.fillRect(midX - labelWidth/2, midY - labelHeight/2, labelWidth, labelHeight);
            ctx.strokeRect(midX - labelWidth/2, midY - labelHeight/2, labelWidth, labelHeight);
            
            // Label text
            ctx.fillStyle = '#333';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(label, midX, midY + 3);
        }
    };

    const getConnectionPoints = (fromId: string, toId: string) => {
        const fromPos = positions[fromId];
        const toPos = positions[toId];
        
        if (!fromPos || !toPos) return { x1: 0, y1: 0, x2: 0, y2: 0 };
        
        const fromCenterX = fromPos.x + fromPos.width / 2;
        const fromCenterY = fromPos.y + fromPos.height / 2;
        const toCenterX = toPos.x + toPos.width / 2;
        const toCenterY = toPos.y + toPos.height / 2;
        
        let x1, y1, x2, y2;
        
        if (Math.abs(toCenterX - fromCenterX) > Math.abs(toCenterY - fromCenterY)) {
            if (toCenterX > fromCenterX) {
                x1 = fromPos.x + fromPos.width;
                y1 = fromCenterY;
                x2 = toPos.x;
                y2 = toCenterY;
            } else {
                x1 = fromPos.x;
                y1 = fromCenterY;
                x2 = toPos.x + toPos.width;
                y2 = toCenterY;
            }
        } else {
            if (toCenterY > fromCenterY) {
                x1 = fromCenterX;
                y1 = fromPos.y + fromPos.height;
                x2 = toCenterX;
                y2 = toPos.y;
            } else {
                x1 = fromCenterX;
                y1 = fromPos.y;
                x2 = toCenterX;
                y2 = toPos.y + toPos.height;
            }
        }
        
        return { x1, y1, x2, y2 };
    };

    const isPointInShape = (x: number, y: number, stepId: string): boolean => {
        const pos = positions[stepId];
        if (!pos) return false;
        
        const step = processSteps.find(s => s.processStepId === stepId);
        if (!step) return false;
        
        if (step.shapeType === 'Decision') {
            // Diamond shape hit detection
            const centerX = pos.x + pos.width / 2;
            const centerY = pos.y + pos.height / 2;
            const dx = Math.abs(x - centerX);
            const dy = Math.abs(y - centerY);
            return (dx / (pos.width / 2) + dy / (pos.height / 2)) <= 1;
        } else if (step.shapeType === 'Start' || step.shapeType === 'End') {
            // Ellipse hit detection
            const centerX = pos.x + pos.width / 2;
            const centerY = pos.y + pos.height / 2;
            const dx = (x - centerX) / (pos.width / 2);
            const dy = (y - centerY) / (pos.height / 2);
            return (dx * dx + dy * dy) <= 1;
        } else {
            // Rectangle hit detection
            return x >= pos.x && x <= pos.x + pos.width && y >= pos.y && y <= pos.y + pos.height;
        }
    };

    // Zoom and pan functions
    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev * 1.2, 3));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev / 1.2, 0.3));
    };

    const handleResetZoom = () => {
        setZoom(1);
        setPanX(0);
        setPanY(0);
    };

    const handleFitToScreen = () => {
        if (processSteps.length === 0) return;
        
        // Calculate the bounds of all shapes
        const allPositions = Object.values(positions);
        if (allPositions.length === 0) return;
        
        const minX = Math.min(...allPositions.map(pos => pos.x));
        const maxX = Math.max(...allPositions.map(pos => pos.x + pos.width));
        const minY = Math.min(...allPositions.map(pos => pos.y));
        const maxY = Math.max(...allPositions.map(pos => pos.y + pos.height));
        
        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        
        // Add padding
        const padding = 50;
        const availableWidth = width - padding * 2;
        const availableHeight = height - padding * 2;
        
        // Calculate the scale to fit content
        const scaleX = availableWidth / contentWidth;
        const scaleY = availableHeight / contentHeight;
        const newZoom = Math.min(scaleX, scaleY, 2); // Max zoom of 2x for fit-to-screen
        
        // Calculate center position
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const canvasCenterX = width / 2;
        const canvasCenterY = height / 2;
        
        const newPanX = canvasCenterX - centerX * newZoom;
        const newPanY = canvasCenterY - centerY * newZoom;
        
        setZoom(newZoom);
        setPanX(newPanX);
        setPanY(newPanY);
    };

    const getMousePosition = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left - panX) / zoom;
        const y = (event.clientY - rect.top - panY) / zoom;
        return { x, y };
    };

    // Draw everything
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Set high DPI
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        // Apply zoom and pan transformations
        ctx.save();
        ctx.translate(panX, panY);
        ctx.scale(zoom, zoom);
        
        // Draw connections first (so they appear behind shapes)
        connections.forEach((connection) => {
            const { x1, y1, x2, y2 } = getConnectionPoints(connection.from, connection.to);
            drawArrow(ctx, x1, y1, x2, y2, connection.label);
        });
        
        // Draw shapes
        processSteps.forEach((step) => {
            const pos = positions[step.processStepId];
            if (!pos) return;
            
            const isHovered = hoveredStep === step.processStepId;
            const isSelected = selectedStepId === step.processStepId;
            
            switch (step.shapeType) {
                case 'Start':
                    drawStartShape(ctx, pos.x, pos.y, pos.width, pos.height, step.processStepDescription, step.function, isHovered, isSelected);
                    break;
                case 'Process':
                    drawProcessShape(ctx, pos.x, pos.y, pos.width, pos.height, step.processStepDescription, step.function, isHovered, isSelected);
                    break;
                case 'Decision':
                    drawDecisionShape(ctx, pos.x, pos.y, pos.width, pos.height, step.processStepDescription, step.function, isHovered, isSelected);
                    break;
                case 'End':
                    drawEndShape(ctx, pos.x, pos.y, pos.width, pos.height, step.processStepDescription, step.function, isHovered, isSelected);
                    break;
            }
        });
        
        ctx.restore();
    }, [processSteps, positions, connections, hoveredStep, selectedStepId, width, height, zoom, panX, panY]);

    // Mouse event handlers
    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (event.button === 0) { // Left mouse button
            const { x, y } = getMousePosition(event);
            
            // Check if clicking on a shape
            let clickedStepId = null;
            for (const step of processSteps) {
                if (isPointInShape(x, y, step.processStepId)) {
                    clickedStepId = step.processStepId;
                    break;
                }
            }
            
            if (clickedStepId && onStepClick) {
                // Step was clicked, call the callback
                onStepClick(clickedStepId);
                event.preventDefault();
            } else {
                // No step clicked, start panning
                setIsDragging(true);
                setLastMousePos({ x: event.clientX, y: event.clientY });
            }
        }
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        if (isDragging) {
            // Pan the canvas
            const deltaX = event.clientX - lastMousePos.x;
            const deltaY = event.clientY - lastMousePos.y;
            setPanX(prev => prev + deltaX);
            setPanY(prev => prev + deltaY);
            setLastMousePos({ x: event.clientX, y: event.clientY });
            canvas.style.cursor = 'grabbing';
        } else {
            // Check for hover
            const { x, y } = getMousePosition(event);
            
            let foundHover = null;
            for (const step of processSteps) {
                if (isPointInShape(x, y, step.processStepId)) {
                    foundHover = step.processStepId;
                    break;
                }
            }
            
            setHoveredStep(foundHover);
            canvas.style.cursor = foundHover ? 'pointer' : 'grab';
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setHoveredStep(null);
        setIsDragging(false);
        if (canvasRef.current) {
            canvasRef.current.style.cursor = 'default';
        }
    };

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                className="border rounded-lg bg-white"
            />
            
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border">
                <button
                    onClick={handleZoomIn}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                    title="Zoom In"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                        <line x1="8" y1="11" x2="14" y2="11"/>
                        <line x1="11" y1="8" x2="11" y2="14"/>
                    </svg>
                </button>
                <button
                    onClick={handleZoomOut}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                    title="Zoom Out"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                        <line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                </button>
                <button
                    onClick={handleFitToScreen}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                    title="Fit to Screen"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
                        <path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
                        <path d="M3 16v3a2 2 0 0 0 2 2h3"/>
                        <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
                    </svg>
                </button>
                <button
                    onClick={handleResetZoom}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-xs font-bold"
                    title="Reset Zoom & Pan"
                >
                    1:1
                </button>
            </div>
            
            {/* Zoom Level Indicator */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-600 border">
                {Math.round(zoom * 100)}%
            </div>
        </div>
    );
};