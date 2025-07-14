import subprocess

def run_pipeline():
    subprocess.run(["python", "src/download_from_supabase.py"], check=True)
    subprocess.run(["python", "src/clean_data.py"], check=True)
    subprocess.run(["python", "src/embed_with_sbert.py"], check=True)
    print("✅ Pipeline finished")

if __name__ == "__main__":
    run_pipeline()
