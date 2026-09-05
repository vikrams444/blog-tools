// Theme Maker - External JavaScript
// Host this file on GitHub Pages, Gist, or any HTTPS server
// and reference it via <script src="YOUR_URL/theme_maker.js"></script>

document.addEventListener("DOMContentLoaded", function () {

    // const code = document.getElementById('code');
    const body = document.body;
    const htmlElement = document.documentElement;
    let currentMode = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const colorInput = document.getElementById('colorInput');
    const colorContainer = document.getElementById('colorContainer');
    const colorValueBlock = document.getElementById('colorValueBlock');
    const colorValue = document.getElementById('colorValue');
    const ColorPreview = document.getElementById('ColorPreview');
    // const copyColorBtn = document.getElementById('copyColorBtn');
    const hslGroup = document.getElementById('hsl-group-id');
    const alphaGroup = document.getElementById('alpha-group-id');
    const hueValueInput = document.getElementById('hueValueInput');
    const hueSlider = document.getElementById('hueRange');
    const saturationSlider = document.getElementById('saturationRange');
    const saturationValue = document.getElementById('saturationValue');
    const lightnessSlider = document.getElementById('lightnessRange');
    const lightnessValue = document.getElementById('lightnessValue');
    const alphaSlider = document.getElementById('alphaSlider');
    const alphaValue = document.getElementById('alphaValue');
    const borderId = document.getElementById('border-id');
    const borderSizeSlider = document.getElementById('borderSizeSlider');
    const borderSizeValue = document.getElementById('borderSizeValue');
    const borderRadiusSlider = document.getElementById('borderRadiusSlider');
    const borderRadiusValue = document.getElementById('borderRadiusValue');
    const shadowId = document.getElementById('shadow-id');
    const shadowBlurSlider = document.getElementById("shadowBlurSlider");
    const shadowBlurValue = document.getElementById("shadowBlurValue");
    const shadowXSlider = document.getElementById("shadowXSlider");
    const shadowYSlider = document.getElementById("shadowYSlider");
    const shadowXValue = document.getElementById("shadowXValue");
    const shadowYValue = document.getElementById("shadowYValue");
    let variableCombo = document.getElementById("variableCombo");
    let colorTypeCombo = document.getElementById("colorTypeCombo");        
    let selectedVariable = variableCombo.value;
    let selectedColorType = colorTypeCombo.value;

    const themes = {
        light: {
            "bg-dark": "hsl(0, 0%, 90%)", // Dark background color
            "bg": "hsl(0, 50%, 95%)",
            "bg-light": "hsl(0, 50%, 100%)",
            "text-color": "hsl(0, 50%, 30%)",
            "text-muted": "hsl(0, 50%, 60%)",
            "border-color": "hsl(0, 0%, 75%)",
            "border-size": "1px",
            "border": "1px solid var(--border-color)",
            "border-radius": "5px",
            "shadow-color": "hsla(0, 50%, 50%, .5)",
            "shadow-blur": "1px",
            "shadow-x": "0px",
            "shadow-y": "0px",
            "shadow": "0 1px 1px hsla(var(--hue), 50%, 50%, .5)",
        },
        dark: {
            "bg-dark": "hsl(0, 0%, 10%)",
            "bg": "hsl(0, 0%, 15%)",
            "bg-light": "hsl(0, 0%, 20%)",
            "text-color": "hsl(0, 0%, 80%)",
            "text-muted": "hsl(0, 0%, 50%)",
            "border-color": "hsl(0, 0%, 25%)",
            "border-size": "1px",
            "border": "1px solid var(--border-color)",
            "border-radius": "5px",
            "shadow-color": "hsla(0, 50%, 10%, .3)",
            "shadow-blur": "1px",
            "shadow-x": "0px",
            "shadow-y": "0px",
            "shadow": "0 1px 1px hsla(var(--hue), 50%, 10%, .3)",
        }
    };

    // FUNCTIONS
    function syncSliders() {
        // Special handling for shadow and border-color
        let color;
        if (selectedVariable === "shadow") {
            color = themes[currentMode]["shadow-color"];
        } else if (selectedVariable === "border") {
            color = themes[currentMode]["border-color"];
        } else {
            color = themes[currentMode][selectedVariable];
        }

        if (!color) return;

        let hsl = getHslColor(color);

        if (!hsl) return;

        let displayHue = hsl.h;

        // undo offsets for text colors
        if (selectedVariable === "text-color") {
            displayHue = (hsl.h - 60 + 360) % 360;
        }
        if (selectedVariable === "text-muted") {
            displayHue = (hsl.h - 300 + 360) % 360;
        }

        hueSlider.value = displayHue;
        saturationSlider.value = hsl.s;
        lightnessSlider.value = hsl.l;
        alphaSlider.value = hsl.a;

        hueValueInput.value = displayHue;
        saturationValue.innerText = hsl.s;
        lightnessValue.innerText = hsl.l;
        alphaValue.innerText = hsl.a;
    }

    function syncColorInput() {                
        const variableColor = themes[currentMode][selectedVariable];
        let color = variableColor;
        let hex = getHexColor(color);              
        
        colorInput.value = hex; // Set the input value
        colorValue.innerText = color;
        colorValueBlock.setAttribute('data-copy', color);
        ColorPreview.style.backgroundColor = color;
        // Also update preview in generic container?
        if (colorContainer) {
            // Find preview div inside generic container
            const preview = colorContainer.querySelector('.previewWrapper div');
            if (preview) preview.style.backgroundColor = color;
        }                
    }

    function syncBorderInput() {
        const size = themes[currentMode]["border-size"] || "0px";
        borderSizeSlider.value = parseInt(size, 10);
        borderSizeValue.innerText = size;
        let borderColor = themes[currentMode]["border-color"];
        let hex = getHexColor(borderColor);              
        
        colorInput.value = hex; // Set the input value
        colorValue.innerText = borderColor;
        colorValueBlock.setAttribute('data-copy', borderColor);
        ColorPreview.style.backgroundColor = borderColor;
    }

    function syncShadowInput() {
        const blur = themes[currentMode]["shadow-blur"] || "12px";
        shadowBlurSlider.value = parseInt(blur);
        shadowBlurValue.innerText = blur;
        let shadowColor = themes[currentMode]["shadow-color"];
        let hex = getHexColor(shadowColor);              
        
        colorInput.value = hex; // Set the input value
        colorValue.innerText = shadowColor;
        colorValueBlock.setAttribute('data-copy', shadowColor);
        ColorPreview.style.backgroundColor = shadowColor;
    }

    function syncShadowXY() {
        shadowXSlider.value = parseInt(themes[currentMode]["shadow-x"]);
        shadowYSlider.value = parseInt(themes[currentMode]["shadow-y"]);
        shadowXValue.textContent = shadowXSlider.value;
        shadowYValue.textContent = shadowYSlider.value;
    }

        // Helper to get current color based on mode/inputs
    function getCurrentColor() {               
        let color = colorInput.value;
        let alpha = Number(alphaSlider.value);
        if (selectedColorType === 'rgb') {
            return hexToRGB(color); // Hex
        } else if (selectedColorType === 'rgba') {
            return hexToRGBA(color, alpha);
        } else if (selectedColorType === 'hsl') {
            return hexToHSL(color);
        } else if (selectedColorType === 'hsla') {                    
            return hexToHSL(color);
        }
        return color;
    }

    function getHexColor(color) {               
        if (!color) return "#000000"; // fallback (you can change this)

        let hex = "#000000"; // fallback (you can change this)
        if (color.startsWith('#')) {
            hex = color;
            // Set it if valid hex
            if (hex.length === 7 || hex.length === 4) {
                colorInput.value = hex;
            }                  
        
        } else if (color.startsWith('rgb')) {
            hex = rgbToHex(color); // Hex
        } else if (color.startsWith('hsl')) {
            hex = hslToHex(color, 0);
        }
        return hex;
    }

    function getHslColor(color) {
        let hsl = { h: 0, s: 0, l: 0, a: 1 }; // fallback (you can change this)
        if (!color) return hsl; // fallback (you can change this)

            if (color.startsWith('rgba')) {                    
            hsl = rgbaToHsla(color);  // rgb/rgba to hsl
        } else if (color.startsWith('hsl') || color.startsWith('hsla')) {
            hsl = parseHSLA(color);  // hsl to hsla
        } 
        return hsl;
    }

    function updateHue() {
        const hue = Number(hueSlider.value);
        const saturation = Number(saturationSlider.value);
        const lightness = Number(lightnessSlider.value);
        const alpha = Number(alphaSlider.value);
        let color = colorInput.value;

        hueValueInput.value = hue;
        saturationValue.innerText = saturation;
        lightnessValue.innerText = lightness;
        alphaValue.innerText = alpha;
        let finalHue = hue;

        if (selectedVariable === "text-color") finalHue = (hue + 60) % 360;
        if (selectedVariable === "text-muted") finalHue = (hue + 300) % 360;
        
        if (selectedColorType === 'rgb') {
            color = hexToRGB(color); // Hex
        } else if (selectedColorType === 'rgba') {
            color = hexToRGBA(color, alpha);
        } else if (selectedColorType === 'hsl') {
            color = `hsl(${finalHue}, ${saturation}%, ${lightness}%)`;
        } else if (selectedColorType === 'hsla') {
            color = `hsla(${finalHue}, ${saturation}%, ${lightness}%, ${alpha})`;
        }
        ColorPreview.style.backgroundColor = color;
        colorValue.innerText = color;
        colorValueBlock.setAttribute('data-copy', color);

        updateColor(selectedVariable, color);
        code.textContent = generateCSS();                
    }

    function updateColor(varName, color) {
        if (varName === "border") {
            updateBorder(color);
        } else if (varName === "shadow") {
            updateShadow(color);
        } else {
            themes[currentMode][varName] = color;
            htmlElement.style.setProperty(`--${varName}`, color);
        }
    }

    function updateBorder(color) {
        const size = Number(borderSizeSlider.value);

        // Update theme
        themes[currentMode]["border"] = `${size}px solid ${color}`;
        themes[currentMode]["border-color"] = `${color}`;

        // Update CSS properties
        htmlElement.style.setProperty("--border", themes[currentMode]["border"]);
        htmlElement.style.setProperty("--border-color", color);
        ColorPreview.style.backgroundColor = color;
        colorValue.innerText = color;
        colorValueBlock.setAttribute('data-copy', color);
        // Update CSS code display
        code.textContent = generateCSS();
    }

    function updateShadow(color) {
        // Get current values from inputs
        const alpha = Number(alphaSlider.value);
        const blur = Math.max(0, Number(shadowBlurSlider.value)) + "px";
        const x = Math.max(0, Number(shadowXSlider.value)) + "px";
        const y = Math.max(0, Number(shadowYSlider.value)) + "px";

        // Update theme
        themes[currentMode]["shadow-color"] = color;
        themes[currentMode]["shadow-blur"] = blur;
        themes[currentMode]["shadow-x"] = x;
        themes[currentMode]["shadow-y"] = y;
        themes[currentMode]["shadow"] = `${x} ${y} ${blur} ${color}`;

        // Update CSS properties
        htmlElement.style.setProperty("--shadow-color", color);
        htmlElement.style.setProperty("--shadow-blur", blur);
        htmlElement.style.setProperty("--shadow-x", x);
        htmlElement.style.setProperty("--shadow-y", y);
        htmlElement.style.setProperty("--shadow", themes[currentMode]["shadow"]);
        ColorPreview.style.backgroundColor = color;
        colorValue.innerText = color;
        colorValueBlock.setAttribute('data-copy', color);
        shadowXValue.innerText = x;
        shadowYValue.innerText = y;
        // Update CSS code display
        code.textContent = generateCSS();
    }

    function handleSelectionUI() {
        // Define Groups
        const isHsl = selectedColorType === 'hsl' || selectedColorType === 'hsla';
        const isRgb = selectedColorType === 'rgb' || selectedColorType === 'rgba';
        const hasAlpha = selectedColorType === 'hsla' || selectedColorType === 'rgba';

        // 1. Manage Slider Visibility
        if (isHsl) {
            hslGroup.style.display = 'block';
            // Hide generic picker in HSL mode
            colorInput.style.display = 'none';
            syncSliders();
        } else {
            // RGB/RGBA: "no hsl slider"
            hslGroup.style.display = 'none';

            // SHOW Color Picker for ALL variables in RGB mode
            colorContainer.style.display = 'flex';
            colorInput.style.display = 'flex';
            syncColorInput(); 
        }

        // 2. Manage Alpha Visibility
        if (hasAlpha) {
            alphaGroup.style.display = 'flex';
            syncSliders();
        } else {
            alphaGroup.style.display = 'none';
        }

        // 3. Manage Section Visibility
        if (selectedVariable === "border") {
            borderId.style.display = "block";
            shadowId.style.display = "none";
            syncBorderInput();

        } else if (selectedVariable === "shadow") {
            shadowId.style.display = "block";
            borderId.style.display = "none";
            syncShadowInput();

        } else {
            // Standard variables
            borderId.style.display = "none";
            shadowId.style.display = "none";                           
        }               
    }

    function generateCSS() {
        const light = themes.light;
        const dark = themes.dark;

        // Define keys to exclude from the generated CSS
        const excludedKeys = ["shadow-x", "shadow-y"];

        // Helper to turn object into CSS string
        const varsToCSS = (themeObj) =>
            Object.keys(themeObj)
                .filter(key => !excludedKeys.includes(key)) // Filter excluded keys
                .map(key => `--${key}: ${themeObj[key]};`)
                .join('\n                ');

        return `            :root {
                ${varsToCSS(light)}
            }
            .dark {
                ${varsToCSS(dark)}
            }
            .card {
                background-color: var(--bg);
                border: var(--border-size) solid var(--border-color);
                border-radius: var(--border-radius);
                box-shadow: 0 0 var(--shadow-blur) var(--shadow-color);
            }
            @media (prefers-color-scheme: dark) {
                html {
                    background-color: var(--bg-dark);
                    color: var(--text-color);
                }
            }
            `;
    }

    // Expose functions to global scope for onclick handlers in HTML
    window.saveTheme = function () {
        const css = generateCSS();
        const blob = new Blob([css], { type: "text/css" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "theme.css";
        link.click();
    };

    window.copyCSS = function () {
        const css = generateCSS();
        let copyCssBtn = document.getElementById("copyCssBtn");
        navigator.clipboard.writeText(css)
            .then(() => {
                // Visual feedback                    
                copyCssBtn.classList.add('copied');
                setTimeout(() => {
                    copyCssBtn.classList.remove('copied');
                }, 1000);
                console.log('Css copied to clipboard:');
            })
            .catch(() => {
                alert("Copy failed 😢");
            });
    };

    window.addNewVariable = function () {
        // 1. Get input from user (or from input fields)
        const varName = prompt("Enter variable name (without --):", "my-new-var");
        const varValue = prompt("Enter value:", "10px");

        if (!varName || !varValue) return;

        // 2. Add to both light and dark themes
        themes.light[varName] = varValue;
        themes.dark[varName] = varValue;

        // 3. Update the live page efficiently
        document.documentElement.style.setProperty(`--${varName}`, varValue);

        // 4. Update the code block
        code.textContent = generateCSS(); // This will now include the new variable!
    };

    // Copy color value functionality
    function copyColorValue() {
        const colorToCopy = colorValueBlock.getAttribute('data-copy');
        if (colorToCopy) {
            navigator.clipboard.writeText(colorToCopy)
                .then(() => {
                    // Visual feedback
                    colorValueBlock.classList.add('copied');
                    setTimeout(() => {
                        colorValueBlock.classList.remove('copied');
                    }, 1000);
                    console.log('Color copied to clipboard:', colorToCopy);
                })
                .catch(err => {
                    console.error('Failed to copy color:', err);
                    // Fallback to older method
                    var textarea = document.createElement('textarea');
                    textarea.value = colorToCopy;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    colorValueBlock.classList.add('copied');
                    setTimeout(() => {
                        colorValueBlock.classList.remove('copied');
                    }, 1000);
                });
        }
    }
    
    function applyTheme() {
        htmlElement.classList.toggle('dark', currentMode === 'dark');
        const colors = themes[currentMode];

        for (let key in colors) {
            htmlElement.style.setProperty(`--${key}`, colors[key]);
        }
    }

    // Parse HSL string into object
    function parseHSL(hsl) {
        const match = hsl.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
        if (!match) return null;

        return {
            h: Number(match[1]),
            s: Number(match[2]),
            l: Number(match[3])
        };
    }

    function parseHSLA(str) {
        const match = str.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+)\s*)?\)/i);
        if (!match) return null;

        return {
            h: Number(match[1]),
            s: Number(match[2]),
            l: Number(match[3]),
            a: match[4] !== undefined ? Number(match[4]) : 1
        };
    }

    // rgb to hex
    function rgbToHex(color) {
        const match = color.match(/\d+(\.\d+)?/g);
        if (match && match.length >= 3) {
            let r = parseInt(match[0]);
            let g = parseInt(match[1]);
            let b = parseInt(match[2]);
            hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
        return hex;
    }
    
    // rgb / rgba to hex
    function rgbaToHex(color, alpha) {
        const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+)\s*)?\)/i);
        if (!match) return null;

        const r = Number(match[1]);
        const g = Number(match[2]);
        const b = Number(match[3]);
        const a = match[4] !== undefined ? Number(match[4]) : 1;

        const toHex = (n) => n.toString(16).padStart(2, "0").toUpperCase();

        const rr = toHex(r);
        const gg = toHex(g);
        const bb = toHex(b);

        // alpha (0 to 255)
        const aa = toHex(Math.round(a * 255));

        // if full alpha, return normal hex
        if (a === 1) return `#${rr}${gg}${bb}`;
        if (alpha === 1) {
            const aa = toHex(Math.round(a * 255));
            return `#${rr}${gg}${bb}${aa}`;
        } else if (alpha === 0) {
            return `#${rr}${gg}${bb}`;
        }
    }

    // Parse RGBA string and convert to HSL
    function rgbaToHsl(rgba) {
        const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    
        if (!match) return null;

        const r = Number(match[1]) / 255;
        const g = Number(match[2]) / 255;
        const b = Number(match[3]) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        const l = (max + min) / 2;

        let h = 0;
        let s = 0;

        if (diff !== 0) {
            s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

            switch (max) {
                case r: h = ((g - b) / diff + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / diff + 2) / 6; break;
                case b: h = ((r - g) / diff + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    function rgbaToHsla(rgba) {
        const match = rgba.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+)\s*)?\)/i);
        if (!match) return null;

        let r = Number(match[1]) / 255;
        let g = Number(match[2]) / 255;
        let b = Number(match[3]) / 255;
        let a = match[4] !== undefined ? Number(match[4]) : 1;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        let h = 0;
        let s = 0;
        let l = (max + min) / 2;

        if (delta !== 0) {
            s = delta / (1 - Math.abs(2 * l - 1));

            if (max === r) h = ((g - b) / delta) % 6;
            else if (max === g) h = (b - r) / delta + 2;
            else h = (r - g) / delta + 4;

            h = Math.round(h * 60);
            if (h < 0) h += 360;
        }

        s = Math.round(s * 100);
        l = Math.round(l * 100);

        return { h, s, l, a };
    }
        
    // Convert HSL / HSLA to Hex (with alpha)
    function hslToHex(color, alpha) {
        const match = color.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+)\s*)?\)/i);
        if (!match) return null;

        let h = Number(match[1]);
        let s = Number(match[2]) / 100;
        let l = Number(match[3]) / 100;
        let a = match[4] !== undefined ? Number(match[4]) : 1;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;

        let r = 0, g = 0, b = 0;

        if (0 <= h && h < 60) { r = c; g = x; b = 0; }
        else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
        else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
        else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
        else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
        else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        const toHex = (n) => n.toString(16).padStart(2, "0").toUpperCase();

        const rr = toHex(r);
        const gg = toHex(g);
        const bb = toHex(b);

        if (a === 1) return `#${rr}${gg}${bb}`;
        if (alpha === 1) {
            const aa = toHex(Math.round(a * 255));
            return `#${rr}${gg}${bb}${aa}`;
        } else if (alpha === 0) {
            return `#${rr}${gg}${bb}`;
        }
    }
        
    // Convert hex to RGB
    function hexToRGB(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // Convert hex to RGBA
    function hexToRGBA(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function hexToHSL(hex) {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h *= 60;
        }

        return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }

    function hexToHSLA(hex, alpha) {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h *= 60;
        }

        return `hsla(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, ${alpha})`;
    }

    applyTheme();
    // ColorPreview.style.backgroundColor = themes[currentMode][selectedVariable];
    handleSelectionUI();

    // EVENT HANDLER
    // Theme toggle functionality   
    document.getElementById('themeToggle').addEventListener('click', () => {
        currentMode = currentMode === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', currentMode);
        applyTheme();
        handleSelectionUI();  
    });

    // Combo box functionality
    variableCombo.addEventListener("change", function () {
        selectedVariable = variableCombo.value;
        handleSelectionUI();               
    });

    // Color Type Combo functionality
    colorTypeCombo.addEventListener("change", function () {
        selectedColorType = colorTypeCombo.value;
        handleSelectionUI();
    });

    // Hue value input functionality
    hueValueInput.addEventListener('input', function () {
        let hiv = Number(hueValueInput.value);
        if (hiv >= 0 && hiv <= 360) { hueSlider.value = hiv; updateHue(); }
    });

    // Alpha slider functionality
    alphaSlider.addEventListener("input", () => {
        const alpha = Number(alphaSlider.value);
        const color = getCurrentColor();
        alphaValue.innerText = alpha;
        colorValue.innerText = color;
        ColorPreview.style.backgroundColor = color;
    });

    hueSlider.oninput = updateHue;
    saturationSlider.oninput = updateHue;
    lightnessSlider.oninput = updateHue;
    alphaSlider.oninput = updateHue;
    borderSizeSlider.oninput = updateHue;
    borderRadiusSlider.oninput = updateHue;

    // Border size slider functionality
    borderSizeSlider.addEventListener("input", () => {
        let borderSize = Math.max(0, Math.min(20, Number(borderSizeSlider.value)));
        borderSizeSlider.value = borderSize;
        borderSizeValue.innerText = borderSize;
        const sizeValue = `${borderSize}px`;

        // save in theme
        themes[currentMode]["border-size"] = sizeValue;
        document.documentElement.style.setProperty("--border-size", sizeValue);
        code.textContent = generateCSS();
    });

    // Border radius slider functionality
    borderRadiusSlider.addEventListener("input", () => {
        const r = Math.max(0, Number(borderRadiusSlider.value)) + "px";
        borderRadiusValue.innerText = r;

        // save in theme
        themes[currentMode]["border-radius"] = r;
        document.documentElement.style.setProperty("--border-radius", r);
    });

    // Color input functionality
    colorInput.addEventListener("input", () => {
        let color = getCurrentColor(); 
        colorValue.innerText = color;
        ColorPreview.style.backgroundColor = color;               
        updateColor(selectedVariable, color);
        code.textContent = generateCSS();
    });

    // Shadow blur input functionality  
    shadowBlurSlider.addEventListener("input", () => {
        const color = themes[currentMode]["shadow-color"];
        const blur = Math.max(0, Number(shadowBlurSlider.value)) + "px";
        shadowBlurValue.innerText = blur;
        // Update shadow
        updateShadow(color);
    });

    // Shadow X input functionality
    shadowXSlider.addEventListener("input", () => {
        const color = themes[currentMode]["shadow-color"];
        const x = Math.max(0, Number(shadowXSlider.value)) + "px";
        themes[currentMode]["shadow-x"] = x;
        document.documentElement.style.setProperty("--shadow-x", x);
        shadowXValue.textContent = shadowXSlider.value;
        updateShadow(color);
    });

    // Shadow Y input functionality
    shadowYSlider.addEventListener("input", () => {
        const color = themes[currentMode]["shadow-color"];
        const y = Math.max(0, Number(shadowYSlider.value)) + "px";
        themes[currentMode]["shadow-y"] = y;
        document.documentElement.style.setProperty("--shadow-y", y);
        shadowYValue.textContent = shadowYSlider.value;
        updateShadow(color);
    });            

    // Click on the color value block to copy
    colorValueBlock.addEventListener('click', function (e) {
        // Prevent copying when clicking the button since we handle that separately
        if (e.target.id !== 'copyColorBtn') {
            copyColorValue();
        }
    });

});
