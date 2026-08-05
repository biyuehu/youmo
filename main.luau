local function getCookie(name)
    local cookies = {}
    for cookie in string.gmatch(document.cookie, "([^;]+)") do
        table.insert(cookies, cookie)
    end
    for _, cookie in ipairs(cookies) do
        if string.find(cookie, name .. "=") then
            return string.sub(cookie, string.find(cookie, "=") + 1)
        end
    end
    return nil
end

