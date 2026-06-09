import json
import os
import re

transcript_path = r"C:\Users\AABID\.gemini\antigravity\brain\61440040-4a21-4f41-b5bb-1630e16bc980\.system_generated\logs\transcript.jsonl"
output_dir = r"C:\Users\AABID\Desktop\porto"

with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get("type") == "VIEW_FILE" and data.get("status") == "DONE":
                content = data.get("content", "")
                path_match = re.search(r"File Path: `(?:file:///)?([^`]+)`", content, re.IGNORECASE)
                if path_match:
                    filepath = path_match.group(1)
                    filename = os.path.basename(filepath)
                    
                    # We only care about recovering original HTML, CSS, JS files (not the new React ones)
                    if filename.endswith(".jsx") or "src" in filepath or "package.json" in filename:
                        continue
                        
                    recovered_lines = []
                    lines = content.split('\n')
                    is_capturing = False
                    
                    for l in lines:
                        match = re.match(r"^(\d+):\s(.*)$", l)
                        if match:
                            recovered_lines.append(match.group(2))
                    
                    if recovered_lines:
                        out_path = os.path.join(output_dir, filename)
                        # Append or write if it's the first time
                        mode = "a" if os.path.exists(out_path) else "w"
                        # We should be careful about duplicates if a file was viewed multiple times
                        # But wait, we might have viewed lines 1-800, then 800-1000.
                        # For simplicity, let's just collect all lines and deduplicate based on line number.
        except Exception as e:
            pass

# Better approach: store lines by filename and line number
files_data = {}
with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get("type") == "VIEW_FILE" and data.get("status") == "DONE":
                content = data.get("content", "")
                path_match = re.search(r"File Path: `(?:file:///)?([^`]+)`", content, re.IGNORECASE)
                if path_match:
                    filepath = path_match.group(1)
                    filename = os.path.basename(filepath)
                    
                    if filename.endswith(".jsx") or "src" in filepath or "package.json" in filename:
                        continue
                        
                    if filename not in files_data:
                        files_data[filename] = {}
                        
                    lines = content.split('\n')
                    for l in lines:
                        match = re.match(r"^(\d+):\s?(.*)$", l)
                        if match:
                            line_num = int(match.group(1))
                            line_content = match.group(2)
                            files_data[filename][line_num] = line_content
        except Exception as e:
            pass

for filename, lines_dict in files_data.items():
    out_path = os.path.join(output_dir, filename)
    # sort by line number
    sorted_lines = [lines_dict[k] for k in sorted(lines_dict.keys())]
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sorted_lines))
    print(f"Recovered {filename}: {len(sorted_lines)} lines")
