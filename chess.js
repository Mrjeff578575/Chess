class chess {
    constructor(opts) {
        this.width = 750;
        this.height = 750;
        this.lineWidth = 50;
        this.startPos = [0, 0];
        this.endPos = [750, 750];
        this.ctx = null;
        this.chessPieceR = 15;
        this.container = opts.container || document.getElementById('myCanvas');
        //判断棋的颜色
        this.shouldRun = 'white';
        //当前棋的位置集合
        this.chessPiecePosCollection = [];
        this.lock = false;

        this.generateChessBoard();
        const me = this;
        document.addEventListener('click', function(e) {
            console.log(1)
            if (me.lock) return;
            let pos = me.getChessPiecePos(e);
            me.drawChessPiece(pos);
        })
    }

    generateChessBoard() {
        this.container.width = this.width;
        this.container.height = this.height;
        this.ctx = this.container.getContext("2d");
        this.drawVerticalLine()
        this.drawhorizontalLine()
    }

    drawVerticalLine() {
        for(let i = this.startPos[0]; i <= this.width ; i += this.lineWidth) {
            this.ctx.moveTo(i, this.startPos[1]);
            this.ctx.lineTo(i, this.endPos[1]);
        }
        this.ctx.stroke();
    }

    drawhorizontalLine(ctx) {
        for(let i = this.startPos[1]; i <= this.width ; i += this.lineWidth) {
            this.ctx.moveTo(this.startPos[0], i);
            this.ctx.lineTo(this.endPos[0], i);
        }
        this.ctx.stroke();
    }

    getChessPiecePos(e) {
        let x = e.pageX;
        let y = e.pageY;
        let posX = Math.round(x / this.lineWidth);
        let posY = Math.round(y / this.lineWidth);
        return [posX, posY];
    }

    isAlreadyChessPiece(pos) {
        let length = this.chessPiecePosCollection.length;
        let arr = this.chessPiecePosCollection;
        let isAlreadyChessPiece = false;
        for (let i = 0; i < length; i++) {
            if (arr.indexOf(`${pos[0]}${pos[1]}black`) > -1 || arr.indexOf(`${pos[0]}${pos[1]}white`) > -1) {
                isAlreadyChessPiece = true;
                break;
            }
        }
        return isAlreadyChessPiece;
    }

    drawChessPiece(pos) {
        if (this.isAlreadyChessPiece(pos)) return;
        const me = this;
        this.ctx.beginPath();
        let realPathX = pos[0] * this.lineWidth;
        let realPathY = pos[1] * this.lineWidth;
        this.ctx.moveTo(realPathX, realPathY);
        this.ctx.arc(realPathX, realPathY, this.chessPieceR, 0, Math.PI * 2, true);
        this.ctx.fillStyle= this.shouldRun == 'white' ? "#efefef" : "#000000";
        this.ctx.fill(); 
        let key = `${pos[0]}${pos[1]}${this.shouldRun}`
        this.chessPiecePosCollection.push(key);
        this.checkWin(pos);
        this.changeShouldRun();  
    }

    checkWin(pos) {
        if (this.chessPiecePosCollection.length < 9) {
            return;
        }
        let length =  this.chessPiecePosCollection.length;
        let arr = this.chessPiecePosCollection;
        let countTop = 1;
        let countBottom = 1;
        //往上读取五个点
        for (let i = 0 ;i < length; i++) {
            if (arr.indexOf(`${pos[0]}${pos[1] + countTop }${this.shouldRun}`) > -1) {
                countTop++;
                if (countTop >= 5) {
                    this.doSuccess()
                    break;
                }  
            }
            if (arr.indexOf(`${pos[0]}${pos[1] - countBottom }${this.shouldRun}`) > -1) {
                countBottom++;
                if (countBottom >= 5) {
                    this.doSuccess()
                    break;
                }  
            } 
        }
    }

    doSuccess() {
        this.lock = true;
        let msg = this.shouldRun == 'white' ? '白' : '黑';
        alert(`${msg}棋胜利`);
    }

    changeShouldRun() {
        this.shouldRun = this.shouldRun == 'white' ? 'black' : 'white';
    }

}
window.chess = chess
