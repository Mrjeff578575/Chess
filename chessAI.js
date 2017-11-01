
 class ChessAI {

    constructor(opts) {
        this.chessBoard = opts.chessBoard
        this.chessData = [];
    }

    parseChessData() {
        let chesses = this.chessBoard.chessPiecePosCollection
        for (let x = 0; x < 15; x++) {
            this.chessData[x] = [];
            for (let y = 0; y < 15; y++) {
                this.chessData[x][y] = 0;            
            }
        }
        chesses.forEach((key) => {
            let chess = JSON.parse(key);
            let pos = chess.pos;
            if (!this.chessData[pos[0]]) {
                this.chessData[pos[0]] = [];
            }
            this.chessData[pos[0]][pos[1]] = 1;
        })
    }
    //遍历所有的位置，获取分数最高的位置
    getAiPosition() {
        this.parseChessData();
        let pos = [];  
        let score = 0;  
        for (let x = 0; x < 15; x++) {  
            for (let y = 0; y < 15; y++) {  
                if (!this.chessData[x][y]) {
                    let newScore = this.getPosScore(x, y)
                    if (newScore > score) {  
                        score = newScore;
                        pos = [x, y]; 
                    }  
                }  
            }  
        }  
        return pos;  
    }

    getPosScore(x, y) {  
        let whiteScore = parseInt(this.leftRight(x, y, 1)) + parseInt(this.topBottom(x, y, 1)) + parseInt(this.rightBottom(x, y, 1)) + parseInt(this.rightTop(x, y, 1)) + 100;   
        let blackScore = parseInt(this.leftRight(x, y, 2)) + parseInt(this.topBottom(x, y, 2)) + parseInt(this.rightBottom(x, y, 2)) + parseInt(this.rightTop(x, y, 2)); 
        return whiteScore + blackScore; 
    }  
      
    leftRight(x, y, num) {  
        let death = 0; //0 表示两边都没堵住 1表示一边堵住了 2表示是死棋，不予考虑  
        let count = 0; //连线棋子数 
        this.parseChessData();//对棋盘数据进行刷新
        this.chessData[x][y] = num;   
        for (let i = x; i >= 0; i--) {  
            if (this.chessData[i][y] == num) {  
                count++;  
            } else if (this.chessData[i][y] == 0) {  
                break;  
            } else {  
                death++;
                break;
            }  
        }  
        for (let i = x; i <= 14; i++) {  
            if (this.chessData[i][y] == num) {  
                count++;  
            } else if (this.chessData[i][y] == 0) {  
                break;
            } else {  
                death++;
                break;
            }  
        }  
        return this.getChessModel(--count, death);  
    }  
      
    topBottom(x, y, num) {  
        let death = 0;
        let count = 0;  
        this.parseChessData();
        this.chessData[x][y] = num;  
        for (let i = y; i >= 0; i--) {  
            if (this.chessData[x][i] == num) {  
                count++;  
            } else if (this.chessData[x][i] == 0) {  
                break; 
            } else {  
                death++;
                break;
            }  
        }  
        for (let i = y; i < 15; i++) {  
            if (this.chessData[x][i] == num) {  
                count++;  
            } else if (this.chessData[x][i] == 0) {  
                break;
            } else {  
                death++;
                break;  
            }  
        }  
        return this.getChessModel(--count, death);  
    }  
      
    rightBottom(x, y, num) {  
        var death = 0;
        var count = 0;  
        this.parseChessData();
        this.chessData[x][y] = num;  
        for (var i = x, j = y; i >= 0 && j >= 0; i-- && j--) {  
            if (this.chessData[i][j] == num) {  
                count++;  
            } else if (this.chessData[i][j] == 0) {  
                break;
            } else {  
                death++;
                break;  
            }  
        }  
        for (var i = x, j = y; i < 15 && j < 15; i++ && j++) {  
            if (this.chessData[i][j] == num) {  
                count++;  
            } else if (this.chessData[i][j] == 0) {  
                break; 
            } else {  
                death++;
                break; 
            }  
        }  
        return this.getChessModel(--count, death);  
    }  
      
    rightTop(x, y, num) {  
        let death = 0; 
        let count = 0;  
        this.parseChessData();
        this.chessData[x][y] = num;  
        for (let i = x, j = y; i >= 0 && j < 15; i-- && j++) {  
            if (this.chessData[i][j] == num) {  
                count++;  
            } else if (this.chessData[i][j] == 0) {  
                break;
            } else {  
                death++;
                break; 
            } 
        }  
        for (let i = x, j = y; i < 15 && j >= 0; i++ && j--) {  
            if (this.chessData[i][j] == num) {  
                count++;  
            } else if (this.chessData[i][j] == 0) {  
                break; 
            } else {  
                death++;
                break;
            } 
        }  
        return this.getChessModel(--count, death);  
    }  
    /**
     * 估值函数，判断出走当前位置所得的分值
     */  
    getChessModel(count, death) {  
        const LEVEL_ONE = 0;//单子  
        const LEVEL_TWO = 1;//眠2，眠1  
        const LEVEL_THREE = 1500;//眠3，活2  
        const LEVEL_FOER = 4000;//冲4，活3  
        const LEVEL_FIVE = 10000;//活4  
        const LEVEL_SIX = 100000;//成5  
        if (count == 1 && death == 1) {  
            return LEVEL_TWO; //眠1  
        } else if (count == 2) {  
            if (death == 0) {  
                return LEVEL_THREE; //活2  
            } else if (death == 1) {  
                return LEVEL_TWO; //眠2  
            } else {  
                return LEVEL_ONE; //死棋  
            }  
        } else if (count == 3) {  
            if (death == 0) {  
                return LEVEL_FOER; //活3  
            } else if (death == 1) {  
                return LEVEL_THREE; //眠3  
            } else {  
                return LEVEL_ONE; //死棋  
            }  
        } else if (count == 4) {  
            if (death == 0) {  
                return LEVEL_FIVE; //活4  
            } else if (death == 1) {  
                return LEVEL_FOER; //冲4  
            } else {  
                return LEVEL_ONE; //死棋  
            }  
        } else if (count == 5) {  
            return LEVEL_SIX; //成5  
        }  
        return LEVEL_ONE;  
    }
 }
 window.ChessAI = ChessAI
  