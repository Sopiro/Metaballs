export function scaleImageData(source, scale)
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

export function dist(x0, y0, x1, y1)
{
    return Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
}

// https://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
export function HSVtoRGB(h, s, v)
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

export function map(v, a, b, min, max)
{
    const per = v / (b - a);
    return lerp(min, max, per);
}

export function lerp(a, b, per)
{
    return a + (b - a) * per;
}

export function clamp(v, min, max)
{
    if (v < min) return min;
    else if (v >= max) return max;
    else return v;
}
