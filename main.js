"use strict"

class Ball
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

class Game
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
        });

        this.hueCheck.addEventListener("click", () =>
        {
            this.hsvMode = this.hueCheck.checked;
        });

        this.thresholdRange.addEventListener("change", () =>
        {
            this.threshold = map(this.thresholdRange.value, 0, 100, 0.06, 0.5);
        });

        this.threshold = 0.1;
        this.hsvMode = true;
        this.time = 0;
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
            const my = map(y, 0, this.height, 0, this.stageHeight);
            for (let x = 0; x < this.width; x++)
            {
                const mx = map(x, 0, this.width, 0, this.stageWidth);

                let color = 0xffffff;
                let weight = 0;

                this.balls.forEach(b =>
                {
                    weight += 1 / dist(mx, my, b.x, b.y);
                });

                if (this.hsvMode)
                {
                    weight = clamp(map(weight, 0, this.threshold, 0, 1), 0, 0.9);
                    color = HSVtoRGB(weight, 1, 1);
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

        if (this.scale != 1)
            pixels = scaleImageData(pixels, this.scale);

        this.ctx.putImageData(pixels, 0, 0);
    }
}
function scaleImageData(source, scale)
{
    const res = new ImageData(source.width * scale, source.height * scale);

    for (let y = 0; y < source.height; y++)
    {
        for (let x = 0; x < source.width; x++)
        {
            let ptr = (x + y * source.width) * 4;

            const sR = source.data[ptr];
            const sG = source.data[ptr + 1];
            const sB = source.data[ptr + 2];
            const sA = source.data[ptr + 3];

            ptr = (x + y * res.width) * 4 * scale;

            for (let sy = 0; sy < scale; sy++)
            {
                for (let sx = 0; sx < scale; sx++)
                {
                    ptr = (x + y * res.width) * 4 * scale + (sx + sy * res.width) * 4;

                    res.data[ptr] = sR;
                    res.data[ptr + 1] = sG;
                    res.data[ptr + 2] = sB;
                    res.data[ptr + 3] = sA;
                }
            }
        }
    }

    return res;
}

function dist(x0, y0, x1, y1)
{
    return Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
}

// https://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
function HSVtoRGB(h, s, v)
{
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1)
    {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6)
    {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return Math.round(r * 255) << 16 | Math.round(g * 255) << 8 | Math.round(b * 255)
}

function map(v, a, b, min, max)
{
    const per = v / (b - a);
    return lerp(min, max, per);
}

function lerp(a, b, per)
{
    return a + (b - a) * per;
}

function clamp(v, min, max)
{
    if (v < min) return min;
    else if (v >= max) return max;
    else return v;
}

window.onload = () =>
{
    const g = new Game();
    g.start();
}