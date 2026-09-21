var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

// Permite acessar index.html, CSS, JavaScript e imagens
app.UseDefaultFiles();
app.UseStaticFiles();

app.Run();