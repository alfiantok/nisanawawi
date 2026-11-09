#!/usr/bin/env python3
import json
import os
import subprocess
import time
import urllib.request
import base64
import websocket
from pptx import Presentation
from pptx.util import Inches

def run_export():
    html_path = os.path.abspath('proposal.html')
    output_pptx = os.path.abspath('Proposal-SEO-Catalitics-Punca.pptx')
    temp_dir = os.path.abspath('/tmp/punca_slides_export')
    os.makedirs(temp_dir, exist_ok=True)

    chrome_bin = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    port = 9333

    # Launch Chrome in headless mode with remote debugging
    cmd = [
        chrome_bin,
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--remote-allow-origins=*',
        f'--remote-debugging-port={port}',
        '--window-size=1600,1200',
        f'file://{html_path}'
    ]
    print("Launching Chrome headless...")
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)

    try:
        # Get devtools targets
        targets_url = f'http://127.0.0.1:{port}/json'
        with urllib.request.urlopen(targets_url) as resp:
            targets = json.loads(resp.read().decode())
        
        # Find target for proposal.html
        page_target = None
        for t in targets:
            if 'proposal.html' in t.get('url', ''):
                page_target = t
                break
        if not page_target:
            page_target = targets[0]

        ws_url = page_target['webSocketDebuggerUrl']
        print(f"Connecting to Chrome DevTools WebSocket: {ws_url}")
        ws = websocket.create_connection(ws_url)

        msg_id = 0
        def send_cmd(method, params=None):
            nonlocal msg_id
            msg_id += 1
            payload = {'id': msg_id, 'method': method}
            if params:
                payload['params'] = params
            ws.send(json.dumps(payload))
            while True:
                res = json.loads(ws.recv())
                if res.get('id') == msg_id:
                    return res.get('result', {})

        # Enable Page and Runtime
        send_cmd('Page.enable')
        send_cmd('Runtime.enable')

        # Wait for fonts
        print("Waiting for fonts and layout ready...")
        send_cmd('Runtime.evaluate', {
            'expression': 'document.fonts.ready',
            'awaitPromise': True
        })
        time.sleep(1)

        # Count slides
        res = send_cmd('Runtime.evaluate', {
            'expression': 'document.querySelectorAll(".deck-slide").length'
        })
        total_slides = res.get('result', {}).get('value', 11)
        print(f"Found {total_slides} slides to export.")

        # Hide screen-bar for clean capture
        send_cmd('Runtime.evaluate', {
            'expression': 'document.querySelector(".screen-bar").style.display = "none";'
        })

        # Initialize PPTX presentation (16:9 widescreen)
        prs = Presentation()
        prs.slide_width = Inches(13.333)
        prs.slide_height = Inches(7.5)
        blank_layout = prs.slide_layouts[6]

        slide_images = []
        for i in range(1, total_slides + 1):
            print(f"Capturing Slide {i}/{total_slides}...")
            
            # Scroll slide into view and get bounding box
            bbox_expr = f'''
            (function() {{
                const el = document.getElementById("slide-{i}");
                if (!el) return null;
                el.scrollIntoView();
                const rect = el.getBoundingClientRect();
                return {{
                    x: rect.left + window.pageXOffset,
                    y: rect.top + window.pageYOffset,
                    width: rect.width,
                    height: rect.height
                }};
            }})()
            '''
            res = send_cmd('Runtime.evaluate', {
                'expression': bbox_expr,
                'returnByValue': True
            })
            bbox = res.get('result', {}).get('value')
            if not bbox:
                print(f"Could not get bounding box for slide {i}")
                continue

            time.sleep(0.3)
            # Capture high-res screenshot
            clip_param = {
                'x': bbox['x'],
                'y': bbox['y'],
                'width': bbox['width'],
                'height': bbox['height'],
                'scale': 2 # Retina 2x scale
            }
            shot_res = send_cmd('Page.captureScreenshot', {
                'format': 'png',
                'clip': clip_param,
                'captureBeyondViewport': True
            })

            img_b64 = shot_res.get('data')
            if img_b64:
                img_path = os.path.join(temp_dir, f'slide_{i:02d}.png')
                with open(img_path, 'wb') as f:
                    f.write(base64.b64decode(img_b64))
                slide_images.append(img_path)

                # Add to PPTX
                slide = prs.slides.add_slide(blank_layout)
                slide.shapes.add_picture(img_path, 0, 0, Inches(13.333), Inches(7.5))
            else:
                print(f"Failed to capture slide {i}")

        # Save PPTX
        prs.save(output_pptx)
        print(f"Successfully exported PPTX to: {output_pptx}")
        print(f"File size: {os.path.getsize(output_pptx) / (1024*1024):.2f} MB")

    finally:
        proc.terminate()
        proc.wait()

if __name__ == '__main__':
    run_export()
