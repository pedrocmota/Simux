import pyinstaller_versionfile

pyinstaller_versionfile.create_versionfile(
    output_file="versionfile.txt",
    version="1.0",
    company_name="Instituto Federal da Bahia - Campus Salvador",
    file_description="Simux - Simulador de controle automático",
    internal_name="simux",
    legal_copyright="© IFBA SSA. Todos os direitos reservados.",
    original_filename="Simux.exe",
    product_name="Simux",
    translations=[0x0416, 1200]
)