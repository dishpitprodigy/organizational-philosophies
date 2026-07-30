-- Render preview part dividers as real LaTeX parts while leaving EPUB H1
-- structure intact. Part titles contain no raw TeX and are assembly-owned.
function Header(element)
  if not FORMAT:match("latex") or element.level ~= 1 then
    return element
  end

  for _, class_name in ipairs(element.classes) do
    if class_name == "part" then
      local title = pandoc.utils.stringify(element.content)
      title = title:gsub("^Part [IVXLCDM]+:%s*", "")
      return pandoc.RawBlock("latex", "\\part{" .. title .. "}")
    end
  end

  return element
end
