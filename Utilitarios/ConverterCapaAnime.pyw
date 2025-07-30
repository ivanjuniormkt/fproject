import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageFilter
import os

def redimensionar_cover(imagem_caminho, tamanho_saida=(352, 500)):
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

    # 🔥 Aplica leve sharpening para ganhar nitidez estilo Convertio
    img_crop = img_crop.filter(ImageFilter.UnsharpMask(radius=0.8, percent=100, threshold=3))

    # Pasta de saída
    caminho_salve = r"C:\Users\ivand\Documents\fansub\img"
    os.makedirs(caminho_salve, exist_ok=True)

    # Salvar com alta qualidade e subsampling 4:4:4
    nome_saida = os.path.join(caminho_salve, "idcapa.webp")
    img_crop.save(
        nome_saida,
        "WEBP",
        quality=95,         # Qualidade alta para manter nitidez
        method=6,
        optimize=True,
        lossless=False
    )

    return nome_saida

def escolher_imagem():
    caminho = filedialog.askopenfilename(
        filetypes=[("Imagens", "*.jpg *.jpeg *.png *.bmp *.gif *.webp")]
    )
    if caminho:
        try:
            saida = redimensionar_cover(caminho)
            messagebox.showinfo("Sucesso", f"Imagem salva como:\n{saida}")
        except Exception as e:
            messagebox.showerror("Erro", f"Ocorreu um erro:\n{str(e)}")

# Interface Tkinter
janela = tk.Tk()
janela.title("Conversor para WEBP - Estilo Cover")
janela.geometry("400x200")
janela.resizable(False, False)

label = tk.Label(janela, text="Clique no botão para escolher uma imagem", font=("Arial", 12))
label.pack(pady=20)

botao = tk.Button(janela, text="Escolher Imagem", command=escolher_imagem, font=("Arial", 12), bg="#4CAF50", fg="white")
botao.pack(pady=10)

janela.mainloop()
