# Open DesignMD

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Open Source Love](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-orange.svg)](https://github.com/ellerbrock/open-source-badges/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black)](https://nextjs.org/)
[![LLM Agnostic](https://img.shields.io/badge/LLM-agnostic-blueviolet.svg)](#quickstart-windows)

**Free, self-hosted, and multi-provider offline-ready fork of designmd.supply. Generate structural design system specifications (`DESIGN.md`) for your AI coding agents from any URL at zero cost.**

---

## Why This Fork Was Created

The original `designmd.supply` is a brilliant tool, but its core pipeline relied heavily on the proprietary **Context.dev API** to extract style guides, brand metadata, and website markdown. Recently, Context.dev transitioned to a paid-only subscription model, which blocked free tier access and caused server timeouts (502 errors) for local and open-source deployments.

**Open DesignMD** was created to keep this amazing concept alive and accessible. We substituted all proprietary paid endpoints with free, high-quality, and robust open alternatives, allowing you to run the entire extraction and LLM pipeline completely for free.

---

## When to Choose Open DesignMD

You should choose this fork if:

* **You want a zero-cost workflow:** You want to run the tool without managing monthly subscriptions or providing credit cards to corporate APIs.
* **You prefer diverse AI providers:** You want to run queries through OpenRouter (to use extremely affordable models like DeepSeek-V3), locally via Ollama, or directly through standard OpenAI, Google Gemini, or Anthropic APIs.
* **You need a portable environment:** You are on Windows and want a simple "download and run" setup that doesn't require global Node.js or Git installations.

---

## Advantages and Disadvantages (Compared to Original)

To help you choose the right version for your workflow, here is an honest, objective breakdown:

### Advantages:

* **100% Free to Run:** Bypasses the subscription wall. Uses Jina Reader (`r.jina.ai`) for markdown scraping and public screenshot APIs at no cost.
* **Multi-Provider Flexibility:** Supports OpenRouter, Ollama, Google AI Studio, Anthropic, and standard OpenAI. You can configure any model in `.env`.
* **One-Click Portability:** Bundled batch scripts (`install.bat`, `run.bat`) automate the local environment initialization, keeping your host system clean.
* **Optimized Screenshots:** Captures are configured to freeze CSS transitions and pause for 3 seconds, allowing complex React/animations to fully hydrate before snapping the image.
* **Granular Cache Controls:** Includes a dedicated cache utility (`clear-cache.bat`) to instantly drop the local Turso cache when you need fresh generation data.

### Disadvantages:

* **No Raw CSS Parsing:** The original Context.dev API analyzed raw CSS stylesheets to extract exact variables. Open DesignMD relies on Jina Reader's raw page markdown, allowing the LLM to intelligently infer and reconstruct design tokens (colors, typography scales, layouts) from the page's structural content. While highly accurate for 95% of use cases, it does not extract exact raw stylesheet variables.
* **No SVG/Logo Assets:** Does not extract precise brand SVG logos or classification metadata from the target site.

---

## Quickstart (Windows)

1. Download or clone this repository to your local machine.

2. Double-click `install.bat` to automatically download the portable Node.js runtime and configure dependencies.

3. Open `designmd-portable/app/.env` in Notepad and choose your preferred AI provider:

   ```env
   AI_PROVIDER=openrouter
   AI_MODEL=deepseek/deepseek-chat
   OPENROUTER_API_KEY=your_key_here
   ```

4. Double-click `run.bat` to start the application. Your default browser will open to `http://localhost:3000` automatically.
5. To wipe the cached specs or screenshots, double-click `clear-cache.bat`.

---

## Disclaimer

This software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.

All third-party services utilized (such as Jina Reader, Microlink, Thum.io, or your configured LLM providers) are subject to their own respective terms of service and rate limits.

---

## Acknowledgements & Support

A massive, heartfelt thank you goes to the creators of the original **[designmd.supply](https://github.com/context-dot-dev/designmd-supply)** repository and the **Context.dev** team. They built an exceptionally elegant foundation and pioneered the concept of compiling live website telemetry into Markdown-based design systems for AI. 

* **Please go and star their original repository:** [context-dot-dev/designmd-supply](https://github.com/context-dot-dev/designmd-supply) ⭐

If this open-source, free-tier fork saved you time or made your local workflow smoother, and you still have a star to spare, **I would be incredibly grateful if you dropped a star on this fork as well!** ⭐


---

