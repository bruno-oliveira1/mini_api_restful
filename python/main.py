from flask import Flask, request, jsonify
import requests
from datetime import datetime
import os

app = Flask(__name__)

# Substitua pela sua chave de API real
API_KEY = os.environ.get('API_KEY_EXCHANGE', 'c2136d68a654b18829cf89fb7191dca3')
API_URL = 'https://api.exchangerate.host/live'

# Cache em memória
historico_cotacoes = []

@app.route('/cotacao', methods=['GET'])
def get_cotacao():
    params = {
        'access_key': API_KEY,
        'currencies': 'BRL',
        'source': 'EUR',  # se a API suportar, senão use 'USD' e converta
        'format': 1
    }
    response = requests.get(API_URL, params=params)
    data = response.json()
    print(data)

    if data.get('success') and 'quotes' in data:
        # O nome da chave pode mudar, exemplo: "EURBRL"
        cotacao = data['quotes'].get('EURBRL') or data['quotes'].get('USDBRL')
        return jsonify({
            'cotacao': cotacao,
            'data': datetime.now().date().isoformat()
        })
    else:
        return jsonify({'erro': 'Falha ao obter cotação', 'resposta': data}), 500

@app.route('/cotacao', methods=['POST'])
def post_cotacao():
    dados = request.get_json()
    cotacao = dados.get('cotacao')
    if cotacao is None:
        return jsonify({'erro': 'Campo "cotacao" é obrigatório'}), 400

    registro = {
        'cotacao': cotacao,
        'data': datetime.now().isoformat()
    }
    historico_cotacoes.append(registro)
    return jsonify({'mensagem': 'Cotação registrada com sucesso', 'registro': registro}), 201

@app.route('/historico', methods=['GET'])
def get_historico():
    return jsonify(historico_cotacoes)

if __name__ == '__main__':
	host = '0.0.0.0'
	port = 6000
app.run(debug=True, host=host, port=port)
