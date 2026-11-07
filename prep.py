import asyncio, json, math, os, shutil, subprocess
SCENES = [
 ("DOPAMINE", "What is dopamine?"),
 ("MESSENGER", "Dopamine is a chemical messenger in your brain, called a neurotransmitter."),
 ("NOT JUST PLEASURE", "It is often called the pleasure chemical, but that is not the full story."),
 ("WANTING", "Dopamine is mostly about wanting and motivation. It pushes you to go after a reward."),
 ("ANTICIPATION", "It spikes when you expect something good, like a notification, a snack, or a win."),
 ("THE LOOP", "That is why scrolling and games are so hard to stop. Your brain keeps chasing the next reward."),
 ("BIGGER ROLE", "Dopamine also helps with focus, learning, and movement. Low levels in some brain areas are linked to Parkinson's disease."),
 ("HEALTHY BOOST", "You can support healthy dopamine with good sleep, exercise, sunlight, and small goals you actually finish."),
]
async def gen():
    import edge_tts
    for i, (_, t) in enumerate(SCENES):
        dst = f"public/audio/scene{i}.mp3"
        src = os.path.expanduser(f"~/dopamine-video/scene{i}.mp3")
        if os.path.exists(dst):
            continue
        if os.path.exists(src):
            shutil.copy(src, dst)
        else:
            await edge_tts.Communicate(t, "en-US-AndrewNeural").save(dst)
asyncio.run(gen())
out = []
for i, (k, t) in enumerate(SCENES):
    d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", f"public/audio/scene{i}.mp3"]).strip())
    out.append({"id": i, "keyword": k, "text": t, "frames": math.ceil((d + 0.5) * 30)})
json.dump(out, open("src/scenes.json", "w"), indent=1)
print("total frames:", sum(o["frames"] for o in out))
