using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.WebPages;

namespace MVCDemo.CustomHtmlHelpers
{
    public static class CustomHtmlHelpers
    {
        public static IHtmlString Image(this HtmlHelper helper, string src, string alt)
        {
            var tb = new TagBuilder("img");
            tb.Attributes.Add("src", VirtualPathUtility.ToAbsolute(src));
            tb.Attributes.Add("alt", alt);
            return new MvcHtmlString(tb.ToString(TagRenderMode.SelfClosing));
        }

        public static MvcHtmlString LabelHtmlFor<TModel, TValue>(this HtmlHelper<TModel> html, Expression<Func<TModel, TValue>> expression, string template)
        {
            return LabelHtmlFor(html, expression, template, new RouteValueDictionary());
        }

        public static MvcHtmlString LabelHtmlFor<TModel, TValue>(this HtmlHelper<TModel> html, Expression<Func<TModel, TValue>> expression, string template, object htmlAttributes)
        {
            return LabelHtmlFor(html, expression, template, new RouteValueDictionary(htmlAttributes));
        }

        public static MvcHtmlString LabelHtmlFor<TModel, TValue>(this HtmlHelper<TModel> html, Expression<Func<TModel, TValue>> expression, string template, IDictionary<string, object> htmlAttributes)
        {
            var metadata = ModelMetadata.FromLambdaExpression(expression, html.ViewData);
            var htmlFieldName = ExpressionHelper.GetExpressionText(expression);
            var propertyName = metadata.DisplayName ?? metadata.PropertyName ?? htmlFieldName.Split('.').Last();
            if (String.IsNullOrEmpty(propertyName))
            {
                return MvcHtmlString.Empty;
            }

            var labelHtml = template.Replace("{prop}", propertyName);

            var tag = new TagBuilder("label");
            tag.Attributes.Add("for", html.ViewContext.ViewData.TemplateInfo.GetFullHtmlFieldId(htmlFieldName));
            tag.MergeAttributes(htmlAttributes, true);
            tag.InnerHtml = labelHtml;
            
            return MvcHtmlString.Create(tag.ToString(TagRenderMode.Normal));
        }
    }
}