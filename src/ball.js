export class Ball
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
        const r = Math.random() * Math.PI * 2;
        this.vx = Math.cos(r);
        this.vy = Math.sin(r);
    }
}