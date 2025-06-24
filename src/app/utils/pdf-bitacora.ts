// src/app/utils/pdf-bitacora.ts
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Forzar a TypeScript a aceptar la asignación
(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;


interface BitacoraData {
    id: string;
    usuario: {
        nombre: string;
        apellido: string;
        email: string;
    };
    accion: string;
    timestamp: Date | string;
    ip: string;
}

export function generarPDFBitacora(datos: BitacoraData[], filtrosAplicados?: any) {
    // Crear el encabezado de la tabla


    const tableHeader = [
        { text: 'Fecha/Hora', style: 'tableHeader' },
        { text: 'Usuario', style: 'tableHeader' },
        { text: 'Email', style: 'tableHeader' },
        { text: 'Acción', style: 'tableHeader' },
        { text: 'IP', style: 'tableHeader' }
    ];

    // Crear las filas de datos
    const tableBody = [tableHeader];

    datos.forEach(item => {
        const fecha = new Date(item.timestamp);
        const fila = [
            {
                text: fecha.toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                style: 'tableCell'
            },
            {
                text: `${item.usuario?.nombre || 'N/A'} ${item.usuario?.apellido || ''}`.trim(),
                style: 'tableCell'
            },
            {
                text: item.usuario?.email || 'N/A',
                style: 'tableCell'
            },
            {
                text: item.accion || 'N/A',
                style: 'tableCell'
            },
            {
                text: item.ip || 'N/A',
                style: 'tableCell'
            }
        ];
        tableBody.push(fila);
    });

    // Crear información de filtros si existen
    const filtrosInfo = [];
    if (filtrosAplicados) {
        filtrosInfo.push({ text: 'Filtros aplicados:', style: 'filtrosTitulo' });

        if (filtrosAplicados.search) {
            filtrosInfo.push({ text: `• Búsqueda: ${filtrosAplicados.search}`, style: 'filtrosTexto' });
        }
        if (filtrosAplicados.usuario) {
            filtrosInfo.push({ text: `• Usuario ID: ${filtrosAplicados.usuario}`, style: 'filtrosTexto' });
        }
        if (filtrosAplicados.ip) {
            filtrosInfo.push({ text: `• IP: ${filtrosAplicados.ip}`, style: 'filtrosTexto' });
        }
        if (filtrosAplicados.fecha_inicio) {
            filtrosInfo.push({ text: `• Desde: ${new Date(filtrosAplicados.fecha_inicio).toLocaleDateString('es-ES')}`, style: 'filtrosTexto' });
        }
        if (filtrosAplicados.fecha_fin) {
            filtrosInfo.push({ text: `• Hasta: ${new Date(filtrosAplicados.fecha_fin).toLocaleDateString('es-ES')}`, style: 'filtrosTexto' });
        }

        filtrosInfo.push({ text: '\n' });
    }

    // Definición del documento PDF
    const docDefinition: any = {
        pageSize: 'A4',
        pageOrientation: 'landscape', // Orientación horizontal para más espacio
        pageMargins: [40, 60, 40, 60],

        header: {
            columns: [
                { text: 'Sistema de Bitácora', style: 'headerLeft' },
                { text: `Fecha: ${new Date().toLocaleDateString('es-ES')}`, style: 'headerRight' }
            ],
            margin: [40, 20]
        },

        footer: function (currentPage: number, pageCount: number) {
            return {
                columns: [
                    { text: `Total de registros: ${datos.length}`, style: 'footerLeft' },
                    { text: `Página ${currentPage} de ${pageCount}`, style: 'footerRight' }
                ],
                margin: [40, 20]
            };
        },

        content: [
            // Título principal
            {
                text: 'REPORTE DE BITÁCORA',
                style: 'titulo',
                margin: [0, 0, 0, 20]
            },

            // Información de filtros (si existen)
            ...filtrosInfo,

            // Tabla de datos
            {
                table: {
                    headerRows: 1,
                    widths: ['15%', '20%', '25%', '25%', '15%'],
                    body: tableBody,
                    layout: {
                        fillColor: function (rowIndex: number) {
                            return (rowIndex === 0) ? '#4CAF50' : (rowIndex % 2 === 0) ? '#f9f9f9' : null;
                        },
                        hLineWidth: function (i: number, node: any) {
                            return (i === 0 || i === node.table.body.length) ? 2 : 1;
                        },
                        vLineWidth: function (i: number, node: any) {
                            return (i === 0 || i === node.table.widths.length) ? 2 : 1;
                        },
                        hLineColor: function (i: number, node: any) {
                            return (i === 0 || i === node.table.body.length) ? '#2196F3' : '#cccccc';
                        },
                        vLineColor: function (i: number, node: any) {
                            return (i === 0 || i === node.table.widths.length) ? '#2196F3' : '#cccccc';
                        }
                    }
                },
                layout: 'lightHorizontalLines'
            },

            // Información adicional
            { text: '\n' },
            {
                text: `Reporte generado el ${new Date().toLocaleString('es-ES')} por el sistema de bitácora.`,
                style: 'footer',
                alignment: 'center'
            }
        ],

        styles: {
            titulo: {
                fontSize: 22,
                bold: true,
                alignment: 'center',
                color: '#2196F3'
            },
            filtrosTitulo: {
                fontSize: 14,
                bold: true,
                margin: [0, 10, 0, 5]
            },
            filtrosTexto: {
                fontSize: 11,
                margin: [0, 2, 0, 2]
            },
            tableHeader: {
                bold: true,
                fontSize: 12,
                color: 'white',
                fillColor: '#4CAF50',
                margin: [5, 5, 5, 5],
                alignment: 'center'
            },
            tableCell: {
                fontSize: 10,
                margin: [5, 5, 5, 5]
            },
            headerLeft: {
                fontSize: 12,
                bold: true,
                color: '#2196F3'
            },
            headerRight: {
                fontSize: 10,
                alignment: 'right',
                color: '#666666'
            },
            footerLeft: {
                fontSize: 10,
                color: '#666666'
            },
            footerRight: {
                fontSize: 10,
                alignment: 'right',
                color: '#666666'
            },
            footer: {
                fontSize: 9,
                italics: true,
                color: '#666666'
            }
        }
    };

    // Generar y descargar el PDF
    try {
        const fileName = `bitacora_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`;
        (pdfMake as any).createPdf(docDefinition).download(fileName);
    } catch (error) {
        console.error('Error al generar PDF:', error);
        throw new Error('No se pudo generar el archivo PDF');
    }
}

// Función adicional para preview del PDF
export function previsualizarPDFBitacora(datos: BitacoraData[], filtrosAplicados?: any) {
    try {
        generarPDFBitacora(datos, filtrosAplicados);
        // Para abrir en nueva ventana en lugar de descargar:
        // Dentro de tu función
        //pdfMake.createPdf(docDefinition).download('bitacora.pdf');
    } catch (error) {
        console.error('Error al previsualizar PDF:', error);
        throw error;
    }
}