import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageFilter
import os
import random

# Função para redimensionar com padrão 400x236
def redimensionar_shot(imagem_caminho, nome_saida):
    tamanho_saida = (400, 236)
    img = Image.open(imagem_caminho).convert("RGB")
    proporcao_original = img.width / img.height
    proporcao_destino = tamanho_saida[0] / tamanho_saida[1]

    if proporcao_original > proporcao_destino:
        nova_altura = tamanho_saida[1]
        nova_largura = int(nova_altura * proporcao_original)
    else:
        nova_largura = tamanho_saida[0]
        nova_altura = int(nova_largura / proporcao_original)

    img_redimensionada = img.resize((nova_largura, nova_altura), Image.LANCZOS)

    esquerda = (img_redimensionada.width - tamanho_saida[0]) // 2
    topo = (img_redimensionada.height - tamanho_saida[1]) // 2
    direita = esquerda + tamanho_saida[0]
    inferior = topo + tamanho_saida[1]

    img_crop = img_redimensionada.crop((esquerda, topo, direita, inferior))

    # Aplica nitidez estilo Convertio
    img_crop = img_crop.filter(ImageFilter.UnsharpMask(radius=0.8, percent=100, threshold=3))

    # Pasta de saída
    caminho_salve = r"C:\Users\ivand\Documents\fansub\img"
    os.makedirs(caminho_salve, exist_ok=True)

    # Salvar como WEBP
    caminho_final = os.path.join(caminho_salve, nome_saida)
    img_crop.save(
        caminho_final,
        "WEBP",
        quality=95,
        method=6,
        optimize=True,
        lossless=False
    )

    return caminho_final

# Função para escolher 3 imagens e salvar como shot1, shot2, shot3
def escolher_imagens():
    caminhos = filedialog.askopenfilenames(
        title="Escolha 3 imagens",
        filetypes=[("Imagens", "*.jpg *.jpeg *.png *.bmp *.gif *.webp")]
    )
    if len(caminhos) != 3:
        messagebox.showwarning("Aviso", "Selecione exatamente 3 imagens!")
        return

    nomes = ["shot1.webp", "shot2.webp", "shot3.webp"]
    random.shuffle(nomes)  # Embaralha os nomes para salvar aleatoriamente

    try:
        saidas = []
        for i in range(3):
            saida = redimensionar_shot(caminhos[i], nomes[i])
            saidas.append(saida)
        messagebox.showinfo("Sucesso", "Imagens salvas:\n" + "\n".join(saidas))
    except Exception as e:
        messagebox.showerror("Erro", f"Ocorreu um erro:\n{str(e)}")

# Interface Tkinter
janela = tk.Tk()
janela.title("Conversor de Shots - 400x236")
janela.geometry("420x220")
janela.resizable(False, False)

label = tk.Label(janela, text="Escolha 3 imagens para converter em shots", font=("Arial", 12))
label.pack(pady=20)

botao = tk.Button(janela, text="Selecionar 3 Imagens", command=escolher_imagens, font=("Arial", 12), bg="#2196F3", fg="white")
botao.pack(pady=10)

janela.mainloop()
