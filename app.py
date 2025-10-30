from flask import Flask, request, jsonify, render_template
import openai
import os

app = Flask(__name__)

# ★OpenAI APIキーを設定（自分のキーをここに入れる）
openai.api_key = "sk-あなたのAPIキー"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    user_message = request.json["message"]

    # --- OpenAIにメッセージを送信 ---
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "あなたは人狼AIです。人間に扮して自然に会話します。"},
            {"role": "user", "content": user_message}
        ]
    )

    ai_reply = response.choices[0].message["content"]
    return jsonify({"reply": ai_reply})

if __name__ == "__main__":
    app.run(debug=True)
