import database from "../config/supabase.js";
import { onCreateTableStructure } from "./table.js";

const onCreateMonthSummaryTable = (data,title)=>{
    let table_content = "<div>Nenhum registro encontrado</div>"
    if(data.length){
    
    const current_month_summary_table = onCreateTableStructure(data)
  
    const header_html = `<thead
        style="
              background-color: #0078d4;
                color: white;
                text-transform: uppercase;
                letter-spacing: 0.03em;
        "
    >
        <tr>
        ${  
          current_month_summary_table.header.map((header_item)=>
            `<th style="
                  padding: 12px 15px;
                    text-align: left;
          ">${header_item}</th>`
          ).join("")
        }
        </tr>
      </thead> `;
        
    const data_html = `<tbody
            style="
                border-bottom: 1px solid #e5e5e5;
                 transition: background-color 0.2s ease;
            "
        >
          ${
            current_month_summary_table.data.map((data_tr_item)=>
            {
              const data_content = data_tr_item.map((data_item)=>
                `<td style='padding: 12px 15px;'>${data_item}</td>`    
              ).join("");
              return (
                `<tr>
                  ${
                    data_content
                  }
                </tr>`
              )
            }
            ).join("")
          }
        </tbody>`;
  
          table_content = `<table
            style="
            width: 100%;
            border-collapse: collapse;
            font-size: 0.7rem;
            color: #333;
            background-color: #fff;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            border-radius: 8px;
            overflow: hidden;
            "

          >
                ${header_html}
                ${data_html}
            </table>`
  
        }
  
        const table_html = `
        <section class="summary-container">
          <div class="title-container">
            <h1>${title}</h1>
          </div>
          <div class="table-data-container"> 
            ${table_content}
          </div>
        </section>
      `
  
        return table_html
  }
  
  const onCreateMonthSummaryStatistic = async  (table)=>{
  
    const month_statistic = {
      gross_total_price:await database.rpc('sum_column',{
        table_param:table,
        column_param:"Valor Bruto Total"
      }),
      liquid_total_price:await database.rpc("sum_column",{
        table_param:table,
        column_param:"Valor Liquido Total"
      }),
      product_count:await database.rpc('count_column',{
        table_param:table,
        column_param:"Produto"
      }),
      total_sale_count:await database.from('vw_table_total_sale_quantity').select("count"),
      common_sale_count:await database.rpc('sum_column',{
        table_param:table,
        column_param:"Comum"
      }),
      flex_sale_count:await database.rpc('sum_column',{
        table_param:table,
        column_param:"Flex"
      }),
    }
  
    if(month_statistic.total_sale_count.error){
        return {
          html_content:null,
          error:month_statistic.total_sale_count.error
        }
    }
  
    if(month_statistic.gross_total_price.error){
      return {
        html_content:null,
        error:month_statistic.gross_total_price.error
      }
    }
    
    if(month_statistic.liquid_total_price.error){
        return {
          html_content:null,
          error:month_statistic.liquid_total_price.error
        }
      }

    if(month_statistic.product_count.error){
      return {
        html_content:null,
        error:month_statistic.product_count.error
      }
    }  
  
    if(month_statistic.flex_sale_count.error){
      return {
        html_content:null,
        error:month_statistic.flex_sale_count.error
      }
    }  
  
    if(month_statistic.common_sale_count.error){
      return {
        html_content:null,
        error:month_statistic.common_sale_count.error
      }
    }  
    //bruto
  //liquido
    const statistic_html = `
      <div class="statistic-container"
      style="
       padding: 12px 15px;
       display:flex;
       flex-direction:column;
       gap:0.5rem; 
      "
      >
          <div>
            <p>Quantidade total de vendas:<span style="font-weight: bolder;">${month_statistic.total_sale_count.data[0].count || 0}</span></p>
          </div>
           <div>
            <p>Quantidade total de vendas Flex:<span style="font-weight: bolder;">${month_statistic.flex_sale_count.data || 0}</span></p>
          </div>
          <div>
            <p>Quantidade total de vendas Comum:<span style="font-weight: bolder;">${month_statistic.common_sale_count.data || 0}</span></p>
          </div>
          <div>
            <p>Quantidade total de produtos:<span style="font-weight: bolder;">${month_statistic.product_count.data || 0}</span></p>
          </div>
          <div>
            <p>Valor Bruto Total:<span style="font-weight: bolder;">R$  ${month_statistic.gross_total_price.data || 0}</span></p>
          </div>
            <div>
            <p>Valor Líquido Total:<span style="font-weight: bolder;">R$  ${month_statistic.liquid_total_price.data || 0}</span></p>
          </div>
      </div>
    `
  
      return {
        html_content:statistic_html,
        error:null
      }
  
  }

  export {
    onCreateMonthSummaryStatistic,
    onCreateMonthSummaryTable
  }
