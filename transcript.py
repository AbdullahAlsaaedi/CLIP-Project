from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, pipeline
import torch
import sys

device = "cuda" if torch.cuda.is_available() else "cpu"

# Load the model and tokenizer
model_directory = '/Users/abdullahalsaadi/Downloads/MyModelDirectory'

model = AutoModelForSeq2SeqLM.from_pretrained(model_directory)

tokenizer = AutoTokenizer.from_pretrained(model_directory)

gen_kwargs = {"length_penalty": 0.8, "num_beams": 8, "max_length": 128}


pipe = pipeline("summarization", model="transformersbook/pegasus-samsum")

# Generation arguments

def summarize_text(input_text):
    # Process the text using the model
    summary = pipe(input_text, **gen_kwargs)[0]["summary_text"]
    return summary

if __name__ == '__main__':
    # Example usage
    input_text = sys.argv[1]  # Get input text from command line arguments
    print(summarize_text(input_text))