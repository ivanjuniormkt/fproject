import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from PIL import Image, ImageFilter
import os, sys

if getattr(sys, 'frozen', False):
    pasta_base = sys._MEIPASS
else:
    pasta_base = os.path.dirname(os.path.abspath(__file__))

caminho_icon = os.path.join(pasta_base, "icon.ico")
print("Usando ícone em:", caminho_icon)  # Debug

# Função principal para redimensionar, cortar e aplicar filtro com qualidade final em WEBP
def redimensionar_e_salvar(img_path, output_path, tamanho, aplicar_sharpen=False):
    img = Image.open(img_path).convert("RGB")
    proporcao_original = img.width / img.height
    proporcao_destino = tamanho[0] / tamanho[1]

    if proporcao_original > proporcao_destino:
        nova_altura = tamanho[1]
        nova_largura = int(nova_altura * proporcao_original)
    else:
        nova_largura = tamanho[0]
        nova_altura = int(nova_largura / proporcao_original)

    img_redimensionada = img.resize((nova_largura, nova_altura), Image.LANCZOS)

    esquerda = (img_redimensionada.width - tamanho[0]) // 2
    topo = (img_redimensionada.height - tamanho[1]) // 2
    direita = esquerda + tamanho[0]
    inferior = topo + tamanho[1]

    img_crop = img_redimensionada.crop((esquerda, topo, direita, inferior))

    if aplicar_sharpen:
        # Sharpen estilo Convertio (mais eficaz que o básico)
        img_crop = img_crop.filter(ImageFilter.UnsharpMask(radius=0.8, percent=100, threshold=3))

    # Salva como WEBP com qualidade alta e compressão suave (como Convertio)
    img_crop.save(
        output_path,
        "WEBP",
        quality=95,
        method=6,
        optimize=True,
        lossless=False
    )

# Função para processar imagens (1 capa + 3 screenshots)
def processar_imagens(caminhos, id_num):
    capa = None
    shots = []

    for caminho in caminhos:
        img = Image.open(caminho)
        if img.height > img.width:
            capa = caminho
        else:
            shots.append(caminho)

    if not capa or len(shots) != 3:
        messagebox.showerror("Erro", "Você deve selecionar 1 imagem vertical (capa) e 3 horizontais (screenshots).")
        return

    pasta_saida = os.path.join(r"C:\Users\ivand\Documents\fansub\img", f"id{id_num}")
    os.makedirs(pasta_saida, exist_ok=True)

    # Salvar capa em WEBP com qualidade top
    redimensionar_e_salvar(
        capa,
        os.path.join(pasta_saida, f"id{id_num}capa.webp"),
        (352, 500),
        aplicar_sharpen=True
    )

    # Salvar screenshots também como WEBP com mesmo filtro
    for i, shot in enumerate(shots, 1):
        redimensionar_e_salvar(
            shot,
            os.path.join(pasta_saida, f"shot{i}.webp"),
            (400, 236),
            aplicar_sharpen=True
        )

    messagebox.showinfo("Sucesso", f"Imagens salvas em:\n{pasta_saida}")

# Seleção de imagens via diálogo
def escolher_imagens():
    tipos_suportados = [
        ("Todos os arquivos de imagem", "*.jpg *.jpeg *.png *.webp *.avif *.bmp *.tiff *.jfif"),
        ("JPEG", "*.jpg *.jpeg"),
        ("PNG", "*.png"),
        ("WEBP", "*.webp"),
        ("AVIF", "*.avif"),
        ("BMP", "*.bmp"),
        ("TIFF", "*.tiff"),
        ("JFIF", "*.jfif")
    ]
    caminhos = filedialog.askopenfilenames(title="Selecionar 4 imagens", filetypes=tipos_suportados)
    if len(caminhos) != 4:
        messagebox.showerror("Erro", "Selecione exatamente 4 imagens.")
        return

    id_num = entrada_id.get()
    if not id_num.isdigit():
        messagebox.showerror("Erro", "Digite um número de ID válido.")
        return

    processar_imagens(caminhos, id_num)

# Paleta de cores
cor_fundo = "#051720"
cor_frame = "#08202c"
cor_texto = "#ffffff"
cor_botao = "#1997d3"
cor_hover = "#147bb0"
cor_entry_bg = "#214556"

# Janela principal
# Janela principal
janela = tk.Tk()
janela.title("Conversor para WebP (Absolute Fansub)")
janela.geometry("420x250")
janela.configure(bg=cor_fundo)

try:
    janela.iconbitmap(caminho_icon)
except tk.TclError:
    messagebox.showwarning("Erro de Ícone", f"Não foi possível carregar o ícone em:\n{caminho_icon}")

# Estilo
estilo = ttk.Style()
estilo.theme_use("clam")

# Estilizando o frame
estilo.configure("Custom.TFrame",
    background=cor_frame,
    borderwidth=0,
    relief="flat"
)

# Estilizando os rótulos
estilo.configure("Custom.TLabel",
    background=cor_frame,
    foreground=cor_texto,
    font=("Segoe UI", 10)
)

# Estilizando o botão
estilo.configure("Custom.TButton",
    background=cor_botao,
    foreground="white",
    font=("Segoe UI", 10, "bold"),
    padding=8,
    borderwidth=0,
    relief="flat"
)
estilo.map("Custom.TButton",
    background=[("active", cor_hover)]
)

# Estilizando a entrada
estilo.configure("Custom.TEntry",
    fieldbackground=cor_entry_bg,
    background=cor_entry_bg,
    foreground="white",
    padding=6,
    relief="flat"
)

# Criando o frame central com bordas arredondadas
container = ttk.Frame(janela, style="Custom.TFrame", padding=20)
container.pack(expand=True, padx=20, pady=20)

# Label
ttk.Label(container, text="Número do ID (ex: 10):", style="Custom.TLabel").pack(pady=(0, 5))

# Entry
entrada_id = ttk.Entry(container, width=30, style="Custom.TEntry")
entrada_id.pack(pady=(0, 15))

# Botão
ttk.Button(container, text="Selecionar Imagens e Processar", style="Custom.TButton", command=escolher_imagens).pack()

janela.mainloop()