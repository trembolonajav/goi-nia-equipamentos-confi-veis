import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { StoreProvider } from "./data/store";
import { ToastProvider } from "./components/ui";
import Layout from "./components/Layout";
import Login from "./auth/Login";
// sistema
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import ClienteDetalhe from "./pages/ClienteDetalhe";
import ClienteForm from "./pages/ClienteForm";
import Produtos from "./pages/Produtos";
import ProdutoForm from "./pages/ProdutoForm";
import ProdutoDetalhe from "./pages/ProdutoDetalhe";
import PatrimonioDetalhe from "./pages/PatrimonioDetalhe";
import Patrimonios from "./pages/Patrimonios";
import Composicoes from "./pages/Composicoes";
import Disponibilidade from "./pages/Disponibilidade";
import Calendario from "./pages/Calendario";
import Manutencoes from "./pages/Manutencoes";
import NovaLocacao from "./pages/NovaLocacao";
import Pedidos from "./pages/Pedidos";
import PedidoDetalhe from "./pages/PedidoDetalhe";
import Orcamento from "./pages/Orcamento";
import Servicos from "./pages/Servicos";
import ContratoDocumento from "./pages/ContratoDocumento";
import ComprovanteOperacional from "./pages/ComprovanteOperacional";
import Contratos from "./pages/Contratos";
import ContratoDetalhe from "./pages/ContratoDetalhe";
import Expedicoes from "./pages/Expedicoes";
import Devolucoes from "./pages/Devolucoes";
import EventosOperacionais from "./pages/EventosOperacionais";
import Agenda from "./pages/Agenda";
import Obras from "./pages/Obras";
import Receber from "./pages/Receber";
import Financeiro from "./pages/Financeiro";
import Lancamentos from "./pages/Lancamentos";
import EmBreve from "./pages/EmBreve";
// site
import SiteLayout from "./site/SiteLayout";
import Home from "./site/Home";
import Catalogo from "./site/Catalogo";
import SiteProduto from "./site/SiteProduto";
import Duvidas from "./site/Duvidas";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/site" replace />} />
              <Route path="/login" element={<Login />} />

              {/* Site público */}
              <Route path="/site" element={<SiteLayout />}>
                <Route index element={<Home />} />
                <Route path="catalogo" element={<Catalogo />} />
                <Route path="equipamento/:slug" element={<SiteProduto />} />
                <Route path="checkout" element={<Navigate to="/site/catalogo" replace />} />
                <Route path="duvidas" element={<Duvidas />} />
              </Route>

              {/* Sistema interno */}
              <Route path="/app" element={<RequireAuth><Layout /></RequireAuth>}>
                <Route index element={<Dashboard />} />
                <Route path="nova-locacao" element={<NovaLocacao />} />
                <Route path="pedidos" element={<Pedidos />} />
                <Route path="pedidos/:num" element={<PedidoDetalhe />} />
                <Route path="pedidos/:num/orcamento" element={<Orcamento />} />
                <Route path="clientes" element={<Clientes />} />
                <Route path="clientes/novo" element={<ClienteForm />} />
                <Route path="clientes/:id/editar" element={<ClienteForm />} />
                <Route path="clientes/:id" element={<ClienteDetalhe />} />
                <Route path="contratos" element={<Contratos />} />
                <Route path="contratos/:numero" element={<ContratoDetalhe />} />
                <Route path="contratos/:numero/documento" element={<ContratoDocumento />} />
                <Route path="contratos/:numero/:tipo" element={<ComprovanteOperacional />} />
                <Route path="expedicoes" element={<Expedicoes />} />
                <Route path="devolucoes" element={<Devolucoes />} />
                <Route path="trocas" element={<EventosOperacionais tipo="TROCA" />} />
                <Route path="ocorrencias" element={<EventosOperacionais tipo="OCORRENCIA" />} />
                <Route path="produtos" element={<Produtos />} />
                <Route path="produtos/novo" element={<ProdutoForm />} />
                <Route path="produtos/:id/editar" element={<ProdutoForm />} />
                <Route path="produtos/:id" element={<ProdutoDetalhe />} />
                <Route path="patrimonios/:codigo" element={<PatrimonioDetalhe />} />
                <Route path="patrimonios" element={<Patrimonios />} />
                <Route path="composicoes" element={<Composicoes />} />
                <Route path="disponibilidade" element={<Disponibilidade />} />
                <Route path="calendario" element={<Calendario />} />
                <Route path="manutencoes" element={<Manutencoes />} />
                <Route path="agenda" element={<Agenda />} />
                <Route path="obras" element={<Obras />} />
                <Route path="receber" element={<Receber />} />
                <Route path="financeiro" element={<Financeiro />} />
                <Route path="lancamentos" element={<Lancamentos />} />
                <Route path="caucoes" element={<Navigate to="/app/financeiro" replace />} />
                <Route path="precos" element={<EmBreve titulo="Preços e modalidades" />} />
                <Route path="modelos" element={<EmBreve titulo="Modelos de documentos" />} />
                <Route path="servicos" element={<Servicos />} />
              </Route>

              <Route path="*" element={<Navigate to="/site" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
