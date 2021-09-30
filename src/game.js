import { Ball } from "./ball.js";
import * as Util from "./util.js";

export class Game
{
    constructor()
    {
        this.cvs = document.getElementById("cvs");
        this.ctx = this.cvs.getContext("2d");
        this.resRange = document.getElementById("resolution");
        this.hueCheck = document.getElementById("heu");
        this.thresholdRange = document.getElementById("threshold");

        this.canvasWidth = 800;
        this.canvasHeight = 600;
        this.aspectRatio = this.canvasHeight / this.canvasWidth;
        this.cvs.width = this.canvasWidth;
        this.cvs.height = this.canvasHeight;

        this.stageWidth = 200;
        this.stageHeight = this.stageWidth * this.aspectRatio;

        this.scales = [20, 10, 8, 4, 1];
        this.scale = this.scales[2];

        this.width = this.canvasWidth / this.scale;
        this.height = this.canvasHeight / this.scale;

        this.resRange.addEventListener("change", () =>
        {
            this.scale = this.scales[this.resRange.value / 100 * 4];

            this.width = this.canvasWidth / this.scale;
            this.height = this.canvasHeight / this.scale;
            this.tmpCanvas.width = this.width;
            this.tmpCanvas.height = this.height;
        });

        this.hueCheck.addEventListener("click", () =>
        {
            this.hsvMode = this.hueCheck.checked;
        });

        this.thresholdRange.addEventListener("change", () =>
        {
            this.threshold = Util.map(this.thresholdRange.value, 0, 100, 0.06, 0.5);
        });

        this.threshold = 0.1;
        this.hsvMode = true;
        this.time = 0;

        this.tmpCanvas = document.createElement("canvas");
        this.tmpCanvas.width = this.width;
        this.tmpCanvas.height = this.height;
        this.tempCtx = this.tmpCanvas.getContext("2d");
    }

    start()
    {
        this.init();
        this.run();
    }

    init()
    {
        this.balls = [];

        for (let i = 0; i < 5; i++)
        {
            const x = (Math.random() * 2 - 1) + this.stageWidth / 2.0;
            const y = (Math.random() * 2 - 1) + this.stageHeight / 2.0;

            this.balls.push(new Ball(x, y));
        }
    }

    run(t)
    {
        let delta = t - this.time;
        if (isNaN(delta)) delta = 1;

        this.time = t;

        const fps = Math.round(1000 / delta);

        this.update(delta);
        this.render();

        this.ctx.font = '28px sansserif';
        this.ctx.fillText(fps + "fps", 5, 25);

        window.requestAnimationFrame(this.run.bind(this));
    }

    update(delta)
    {
        delta /= 10.0;

        this.balls.forEach(b =>
        {
            b.x += b.vx * delta;
            b.y += b.vy * delta;

            if (b.x < 0 || b.x >= this.stageWidth)
            {
                b.vx *= -1
                b.x += b.vx;
            }
            if (b.y < 0 || b.y >= this.stageHeight)
            {
                b.vy *= -1
                b.y += b.vy;
            }
        });
    }

    render()
    {
        let pixels = new ImageData(this.width, this.height);

        for (let y = 0; y < this.height; y++)
        {
            const my = Util.map(y, 0, this.height, 0, this.stageHeight);
            for (let x = 0; x < this.width; x++)
            {
                const mx = Util.map(x, 0, this.width, 0, this.stageWidth);

                let color = 0xffffff;
                let weight = 0;

                this.balls.forEach(b =>
                {
                    weight += 1 / Util.dist(mx, my, b.x, b.y);
                });

                if (this.hsvMode)
                {
                    weight = Util.clamp(Util.map(weight, 0, this.threshold, 0, 1), 0, 0.9);
                    color = Util.HSVtoRGB(weight, 1, 1);
                }
                else if (weight > this.threshold)
                {
                    color = 0xff00ff;
                }

                const ptr = (x + y * this.width) * 4;
                pixels.data[ptr] = (color >> 16) & 0xff; // R
                pixels.data[ptr + 1] = (color >> 8) & 0xff; // G
                pixels.data[ptr + 2] = (color) & 0xff; // B
                pixels.data[ptr + 3] = 0xff; // A
            }
        }

        /* Previous method
         if (this.scale != 1)
             pixels = scaleImageData(pixels, this.scale);

         this.ctx.putImageData(pixels, 0, 0);
        */

        /* New, better method. FPS doubled. It uses GPU to scale image.
         */
        this.tempCtx.putImageData(pixels, 0, 0);

        this.ctx.save();
        this.ctx.imageSmoothingEnabled = false; // It disabled antialiasing.
        this.ctx.scale(this.scale, this.scale);
        this.ctx.drawImage(this.tmpCanvas, 0, 0)
        this.ctx.restore();

    }
}
