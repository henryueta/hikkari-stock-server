import express from "express";
import Message from "../classes/Message.js";
import database from "../config/supabase.js";
import { onResponseError } from "../functions/error.js";
import { onValidateToken } from "../validation/token.js";
import { onCreateMonthSummaryStatistic, onCreateMonthSummaryTable } from "../functions/summary.js";


const summary_router = express.Router();

summary_router.get("/summary/get",async (req,res)=>{
    
    try {

        const {token}  = req.query;
        const token_validation = onValidateToken(token);

        if(!token_validation.valid){
            return onResponseError(res,401,token_validation.message)
        }

  const current_month_summary_data = await database.from("vw_table_current_month_summary")
  .select("*");

  if(current_month_summary_data.error){
      return onResponseError(res,500,current_month_summary_data.error)
  }
  
  const current_month_summary_html = onCreateMonthSummaryTable(current_month_summary_data.data,"Total de vendas no mês atual")

  const current_month_statistic = await onCreateMonthSummaryStatistic('vw_table_current_month_summary')

  if(current_month_statistic.error){
     return onResponseError(res,500,current_month_statistic.error)
  }
  
  const last_month_summary_data = await database.from("vw_table_last_month_summary")
  .select("*");

  if(last_month_summary_data.error){
      return onResponseError(res,500,current_month_summary_data.error)
  }

  const last_month_summary_html = onCreateMonthSummaryTable(last_month_summary_data.data,"Total de vendas no último mês")

  const last_month_statistic = await onCreateMonthSummaryStatistic('vw_table_last_month_summary')

  if(last_month_statistic.error){
     return onResponseError(res,500,last_month_price_total.error)
  }

  const response_html = `
    <section class="main-summary-container">
      ${current_month_summary_html}
      ${current_month_statistic.html_content}
      ${last_month_summary_html}
      ${last_month_statistic.html_content}
    </section>
  `;

  return res.status(201).send(new Message("Relatório criado com sucesso",{
    html_content:response_html
  }))

    } catch (error) {
        return onResponseError(res,500,error)
    }

})

export default summary_router