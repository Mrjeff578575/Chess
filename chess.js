class Chess {
    constructor(opts) {
        this.redoEl = opts.redoEl || document.getElementById('redo')
        this.undoEl = opts.undoEl || document.getElementById('undo')
        this.successModal = opts.successModal || document.getElementById('modal')
        this.width = opts.width || 750;
        this.height = opts.height || 750;
        this.lineWidth = this.width / 15;
        this.ctx = null;
        this.chessPieceR = opts.chessR || 15;
        this.startPos = [this.chessPieceR, this.chessPieceR];
        this.endPos = [this.width + this.chessPieceR, this.height + this.chessPieceR];

        if (this.chessPieceR > this.lineWidth / 2) {
            throw Error(`can't set chessPieceR because it's value is too big`)
        }
        this.container = opts.container || document.getElementById('myCanvas');
        //判断棋的颜色
        this.shouldRun = 'white';
        //当前棋的位置集合
        this.chessPiecePosCollection = [];
        this.lock = false;

        this.generateChessBoard();
        const me = this;
        document.addEventListener('click', function(e) {
            if (me.lock) return;
            //if (me.shouldRun == 'black' && me.isUseAI) return;
            if (e.target && e.target.tagName != 'CANVAS') return;
            me.isStart = true;
            let pos = me.getChessPiecePos(e);
            me.undoCommandQueue = [];
            me.drawChessPiece(pos);
        })

        this.redoUndoInit();
        this.redoEl && this.redoEl.addEventListener('click', function (e) {
            if (me.lock) return;
            e.stopPropagation();
            me.doRedo();
        });

        this.undoEl && this.undoEl.addEventListener('click', function (e) {
            if (me.lock) return;
            e.stopPropagation();
            me.doUndo();
        });
        //AI
        this.isUseAI = opts.isUseAI;
        if (opts.chessAI) {
            this.chessAI = new opts.chessAI({
                chessBoard: this
            })
        }
    }

    generateChessBoard() {
        this.container.width = this.width + 2 * this.chessPieceR;
        this.container.height = this.height + 2 * this.chessPieceR;
        this.ctx = this.container.getContext("2d");
        this.drawVerticalLine()
        this.drawhorizontalLine()
    }

    drawVerticalLine() {
        for(let i = this.startPos[0]; i <= this.endPos[1] ; i += this.lineWidth) {
            this.ctx.moveTo(i, this.startPos[1]);
            this.ctx.lineTo(i, this.endPos[1]);
        }
        this.ctx.stroke();
    }

    drawhorizontalLine(ctx) {
        for(let i = this.startPos[1]; i <= this.endPos[0] ; i += this.lineWidth) {
            this.ctx.moveTo(this.startPos[0], i);
            this.ctx.lineTo(this.endPos[0], i);
        }
        this.ctx.stroke();
    }

    getChessPiecePos(e) {
        let x = e.pageX - this.container.offsetLeft;
        let y = e.pageY - this.container.offsetTop;
        let posX = Math.round(x / this.lineWidth);
        let posY = Math.round(y / this.lineWidth);
        return [posX, posY];
    }

    isAlreadyChessPiece(pos) {
        let length = this.chessPiecePosCollection.length;
        let arr = this.chessPiecePosCollection;
        let isAlreadyChessPiece = false;
        for (let i = 0; i < length; i++) {
            if (arr.indexOf(this.getChessKey(pos, 'black')) > -1 || arr.indexOf(this.getChessKey(pos, 'white')) > -1) {
                isAlreadyChessPiece = true;
                break;
            }
        }
        return isAlreadyChessPiece;
    }

    drawChessPiece(pos, color = this.shouldRun, isRefresh = false) {
        if (this.isAlreadyChessPiece(pos)) return;
        const me = this;
        this.ctx.beginPath();
        let realPathX = pos[0] * this.lineWidth + this.chessPieceR;
        let realPathY = pos[1] * this.lineWidth + this.chessPieceR;
        this.ctx.moveTo(realPathX, realPathY);
        this.ctx.arc(realPathX, realPathY, this.chessPieceR, 0, Math.PI * 2, true);
        this.ctx.fillStyle = color == 'white' ? "#efefef" : "#000000";
        this.ctx.fill(); 
        let key = this.getChessKey(pos, color);
        this.chessPiecePosCollection.push(key);
        this.checkWin(pos);
        this.redoCommandQueue.push({
            method: 'delete',
            key: key
        });
        this.index++;
        this.changeShouldRun(color); 
        //IF USE AI 
        //Ai绘制
        if (this.shouldRun == 'black' && this.isUseAI && !isRefresh) {
            let aiPos = this.chessAI.getAiPosition();
            this.drawChessPiece(aiPos)
        }
    }

    checkWin(pos) {
        if (this.chessPiecePosCollection.length < 9) {
            return;
        }
        let arr = this.chessPiecePosCollection;
        let length = arr.length;
        let countTop = 1;
        let countBottom = 1;
        let countRight = 1;
        let countLeft = 1;
        let lean = {
            rightTop: 1,
            rightDown: 1,
            leftTop: 1,
            leftDown: 1,
        } 
        for (let i = 0 ;i < length; i++) {
            //往下读取五个点
            if (arr.indexOf(this.getChessKey([pos[0], pos[1] + countBottom])) > -1) {
                countBottom++;
                if (countBottom >= 5) {
                    this.doSuccess()
                    break;
                }  
            }
            //向上
            if (arr.indexOf(this.getChessKey([pos[0], pos[1] - countTop])) > -1) {
                countTop++;
                if (countTop >= 5) {
                    this.doSuccess()
                    break;
                }  
            }
            //向右
            if (arr.indexOf(this.getChessKey([pos[0] + countRight, pos[1]])) > -1) {
                countRight++;
                if (countRight >= 5) {
                    this.doSuccess()
                    break;
                }  
            }
            //向左
            if (arr.indexOf(this.getChessKey([pos[0] - countLeft, pos[1]])) > -1) {
                countLeft++;
                if (countLeft >= 5) {
                    this.doSuccess()
                    break;
                }  
            }
            //斜右下
            if (arr.indexOf(this.getChessKey([pos[0] + lean.rightDown, pos[1] + lean.rightDown])) > -1) {
                lean.rightDown++;
                if (lean.rightDown >= 5) {
                    this.doSuccess()
                    break;
                }  
            }
            //斜右上
            if (arr.indexOf(this.getChessKey([pos[0] + lean.rightTop, pos[1] - lean.rightTop])) > -1) {
                lean.rightTop++;
                if (lean.rightTop >= 5) {
                    this.doSuccess()
                    break;
                }  
            }
            //斜左下
            if (arr.indexOf(this.getChessKey([pos[0] - lean.leftDown, pos[1] + lean.leftDown])) > -1) {
                lean.leftDown++;
                if (lean.leftDown >= 5) {
                    this.doSuccess()
                    break;
                }  
            }
            //斜左上
            if (arr.indexOf(this.getChessKey([pos[0] - lean.leftTop, pos[1] - lean.leftTop])) > -1) {
                lean.leftTop++;
                if (lean.leftTop >= 5) {
                    this.doSuccess()
                    break;
                }  
            }
            if (countTop + countBottom + countRight + countLeft == 4 
                && lean.rightTop + lean.leftTop + lean.rightDown + lean.leftDown == 4) {
                break;
            }
        }
        //识别插入棋子
        if (countTop + countBottom - 1 >= 5 
            || countRight + countLeft - 1 >= 5
            || lean.rightTop + lean.leftDown - 1 >= 5
            || lean.rightDown + lean.leftTop - 1 >= 5
        ) {
            this.doSuccess()
        }
    }

    doSuccess() {
        this.lock = true;
        let msg = this.shouldRun == 'white' ? '白' : '黑';
        if (this.successModal && this.successModal.style) {
            this.successModal.style.display = "block";
            this.successModal.innerHTML = `${msg}棋胜利 !!!`;
            this.successModal.style.lineHeight = this.height + 2 * this.chessPieceR + 'px';
            this.successModal.style.width = this.width + 2 * this.chessPieceR + 'px';
        }
    }

    changeShouldRun(color = this.shouldRun) {
        this.shouldRun = color == 'white' ? 'black' : 'white';
    }

    getChessKey(pos, color = this.shouldRun) {
        return JSON.stringify({
            pos: pos,
            color: color
        })
    }

    deleteChessPiece(pos) {
        let key = this.getChessKey(pos);
        let index = this.chessPiecePosCollection.indexOf(key);
        this.chessPiecePosCollection.splice(index, 1);
        this.refreshCanvas();
    }

    refreshCanvas() {
        let chesses = [];
        this.chessPiecePosCollection.forEach(function(item) {
            let chess = JSON.parse(item);
            chesses.push(chess);
        }, this);
        this.chessPiecePosCollection = [];
        this.index = 0;
        this.redoCommandQueue = [];
        this.generateChessBoard();
        chesses.forEach(function(chess) {
            this.drawChessPiece(chess.pos, chess.color, true);
        }, this);
    }

    redoUndoInit() {
        this.index = 0;
        this.redoCommandQueue = [];
        this.undoCommandQueue = [];
    }

    doRedo() {
        if (!this.redoCommandQueue.length) return;
        let command = this.redoCommandQueue[--this.index];
        let key = JSON.parse(command.key);
        this[command.method + 'ChessPiece'](key.pos, key.color);
        this.undoCommandQueue.push({
            method: 'draw',
            key: JSON.stringify(key)
        });
    }
    doUndo() {
        if (!this.undoCommandQueue.length) return;
        let command = this.undoCommandQueue[0];
        let key = JSON.parse(command.key);
        this[command.method + 'ChessPiece'](key.pos, key.color, true);
        this.undoCommandQueue.splice(0, 1);
    }

}
window.chess = Chess